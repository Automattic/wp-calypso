/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { findLast } from 'lodash';
import page from 'page';

/**
 * Internal dependencies
 */
import { canCurrentUser } from 'state/selectors';
import config from 'config';
import { getActionLog } from 'state/ui/action-log/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { isSiteAutomatedTransfer } from 'state/selectors';
import route from 'lib/route';
import { ROUTE_SET } from 'state/action-types';

class App extends Component {

	static propTypes = {
		canUserManageOptions: PropTypes.bool,
		siteId: PropTypes.number,
		component: PropTypes.node,
		currentRoute: PropTypes.shape( {
			path: PropTypes.string,
		} ),
		isAutomatedTransfer: PropTypes.bool,
	};

	// TODO This is temporary, until we have a valid "all sites" path to show.
	// Calypso will detect if a user doesn't have access to a site at all, and redirects to the 'all sites'
	// version of that URL. We don't want to render anything right now, so continue redirecting to my-sites.
	componentWillReceiveProps( newProps ) {
		if ( this.props.currentRoute !== newProps.currentRoute ) {
			if ( newProps.currentRoute && ! route.getSiteFragment( newProps.currentRoute.path ) ) {
				return page.redirect( '/stats/day' );
			}
		}
	}

	render = () => {
		const { siteId, component, canUserManageOptions, isAutomatedTransfer } = this.props;

		if ( ! siteId ) {
			return null;
		}

		if ( 'wpcalypso' !== config( 'env_id' ) && 'development' !== config( 'env_id' ) ) {
			// Show stats page for non Atomic sites for now
			if ( ! isAutomatedTransfer ) {
				page.redirect( '/stats/day' );
				return null;
			}

			if ( ! canUserManageOptions ) {
				page.redirect( '/stats/day' );
				return null;
			}
		}

		const className = 'woocommerce';
		return (
			<div className={ className }>
				{ component }
			</div>
		);
	}

}

function mapStateToProps( state ) {
	const siteId = getSelectedSiteId( state );
	const canUserManageOptions = siteId && canCurrentUser( state, siteId, 'manage_options' );
	const currentRoute = findLast( getActionLog( state ), { type: ROUTE_SET } );
	const isAutomatedTransfer = siteId && !! isSiteAutomatedTransfer( state, siteId );
	return {
		siteId,
		canUserManageOptions,
		currentRoute,
		isAutomatedTransfer,
	};
}

export default connect( mapStateToProps )( App );
