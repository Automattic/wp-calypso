/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import PostEditStore from 'lib/posts/post-edit-store';
import { fetchConnections } from 'lib/sharing/publicize/actions';
import { getConnectionsBySiteId, hasFetchedConnections } from 'lib/sharing/publicize/selectors';
import EditorSharingAccordion from './accordion';

class EditorSharingContainer extends Component {
	constructor( props ) {
		super( props );

		// Trigger connection fetch
		if ( ! this.props.hasFetchedConnections ) {
			this.fetchConnections();
		}

		// Set state
		this.state = this.getState();

		// Bind legacy store update handler
		this.boundUpdateState = this.updateState.bind( this );
		PostEditStore.on( 'change', this.boundUpdateState );
	}

	componentWillUnmount() {
		PostEditStore.off( 'change', this.boundUpdateState );
	}

	updateState() {
		this.setState( this.getState() );
	}

	getState() {
		return {
			post: PostEditStore.get(),
			isNew: PostEditStore.isNew()
		};
	}

	fetchConnections() {
		const { site, dispatch } = this.props;
		dispatch( fetchConnections( site.ID ) );
	}

	render() {
		const { site, connections } = this.props;
		const { post, isNew } = this.state;

		return (
			<EditorSharingAccordion
				site={ site }
				post={ post }
				isNew={ isNew }
				connections={ connections }
				fetchConnections={ this.fetchConnections.bind( this ) }
				className="editor-drawer__accordion" />
		);
	}
}

EditorSharingContainer.propTypes = {
	site: PropTypes.object.isRequired,
	dispatch: PropTypes.func.isRequired,
	hasFetchedConnections: PropTypes.bool,
	connections: PropTypes.array
};

export default connect(
	( state, props ) => {
		return {
			hasFetchedConnections: hasFetchedConnections( state, props.site.ID ),
			connections: getConnectionsBySiteId( state, props.site.ID )
		};
	}
)( EditorSharingContainer );
