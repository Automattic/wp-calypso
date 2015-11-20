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
		const { site, state } = props;

		super( props );

		// Trigger connection fetch
		if ( ! hasFetchedConnections( state, site.ID ) ) {
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
		const { site, state } = this.props;
		const { post, isNew } = this.state;
		const connections = getConnectionsBySiteId( state, site.ID );

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
	state: PropTypes.object.isRequired,
	dispatch: PropTypes.func.isRequired
};

export default connect(
	( state ) => {
		return { state };
	}
)( EditorSharingContainer );
