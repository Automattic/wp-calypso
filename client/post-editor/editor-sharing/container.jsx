/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import PostEditStore from 'lib/posts/post-edit-store';
import { fetchConnections } from 'state/sharing/publicize/actions';
import { getConnectionsBySiteIdAvailableToCurrentUser, hasFetchedConnections } from 'state/sharing/publicize/selectors';
import { getSelectedSite } from 'state/ui/selectors';
import EditorSharingAccordion from './accordion';

class EditorSharingContainer extends Component {
	constructor( props ) {
		super( props );

		// Set state
		this.state = this.getState();

		// Trigger connection fetch
		this.ensureHasConnections();

		// Bind legacy store update handler
		this.boundUpdateState = this.updateState.bind( this );
		PostEditStore.on( 'change', this.boundUpdateState );
	}

	componentDidUpdate() {
		this.ensureHasConnections();
	}

	componentWillUnmount() {
		PostEditStore.off( 'change', this.boundUpdateState );
	}

	ensureHasConnections() {
		if ( this.props.hasFetchedConnections ) {
			return;
		}

		this.fetchConnections();
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
		if ( ! site ) {
			return;
		}

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
	site: PropTypes.object,
	currentUserID: PropTypes.number.isRequired,
	dispatch: PropTypes.func.isRequired,
	hasFetchedConnections: PropTypes.bool,
	connections: PropTypes.array
};

export default connect(
	( state, ownProps ) => {
		const site = getSelectedSite( state );
		return {
			hasFetchedConnections: site && hasFetchedConnections( state, site.ID ),
			connections: site ? getConnectionsBySiteIdAvailableToCurrentUser( state, site.ID, ownProps.currentUserID ) : null,
			site
		};
	}
)( EditorSharingContainer );
