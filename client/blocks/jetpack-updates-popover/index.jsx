/**
 * External dependencies
 */
import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import QuerySiteUpdates from 'components/data/query-site-updates';
import {
	renderWPComTemplate,
	renderPluginsTemplate,
	renderThemesTemplate,
} from './update-templates';
import { isFinished as isJetpackPluginsFinished } from 'state/plugins/premium/selectors';
import {
	getUpdatesBySiteId,
	hasWordPressUpdate,
	hasUpdates as siteHasUpdate,
	getSectionsToUpdate,
} from 'state/sites/updates/selectors';
import { isJetpackSite } from 'state/sites/selectors';
import { canCurrentUser } from 'state/current-user/selectors';
import Popover from 'components/popover';

class JetpackUpdatesPopover extends Component {
	static propTypes = {
		isJetpack: React.PropTypes.bool,
		isVisible: React.PropTypes.bool,
		hasWPUpdate: PropTypes.bool,
		hasUpdates: PropTypes.bool,
		onClose: PropTypes.func,
		site: PropTypes.object,
		updates: PropTypes.object
	};

	constructor( props ) {
		super( props );

		this.state = {
			showPopover: false
		};
	}

	toggleJetpackNotificatonsPopover() {
		this.setState( { showPopover: ! this.state.showPopover } );
	}

	hideJetpackNotificatonsPopover() {
		this.setState( { showPopover: false } );
	}

	handleWPCOMUpdate( ev ) {
		ev.preventDefault();
	}

	render() {
		const { context, isVisible, onClose, position, site } = this.props;

		return (
			<Popover
				className="jetpack-updates-popover"
				id="popover__jetpack-notifications"
				isVisible={ isVisible }
				onClose={ onClose }
				position={ position }
				context={ context }
			>
				<QuerySiteUpdates siteId={ site.ID } />

				{ renderWPComTemplate( this.props ) }
				{ renderPluginsTemplate( this.props ) }
				{ renderThemesTemplate( this.props ) }
			</Popover>
		);
	}
}

export default connect( ( state, ownProps ) => {
	const siteId = ownProps.site && ownProps.site.ID ? ownProps.site.ID : null;

	return {
		isJetpack: isJetpackSite( state, siteId ),
		hasUpdates: siteHasUpdate( state, siteId ),
		hasWPUpdate: hasWordPressUpdate( state, siteId ),
		canManageOptions: canCurrentUser( state, siteId, 'manage_options' ),
		pausedJetpackPluginsSetup: ! isJetpackPluginsFinished( state, siteId ),
		updates: getUpdatesBySiteId( state, siteId ),
		sectionsToUpdate: getSectionsToUpdate( state, siteId ),
	};
} )( localize( JetpackUpdatesPopover ) );

