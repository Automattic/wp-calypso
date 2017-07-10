/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import page from 'page';

/**
 * Internal dependencies
 */
import { canCurrentUser } from 'state/selectors';
import config from 'config';
import { getSelectedSiteId } from 'state/ui/selectors';
import { isSiteAutomatedTransfer } from 'state/selectors';
import route from 'lib/route';

class App extends Component {

	static propTypes = {
		siteId: PropTypes.number,
		canUserManageOptions: PropTypes.bool.isRequired,
		currentRoute: PropTypes.string.isRequired,
		isAtomicSite: PropTypes.bool.isRequired,
		children: PropTypes.element.isRequired,
	};

	redirect = () => {
		window.location.href = '/stats/day';
	}

	render = () => {
		const { siteId, children, canUserManageOptions, isAtomicSite, currentRoute } = this.props;

		// TODO This is temporary, until we have a valid "all sites" path to show.
		// Calypso will detect if a user doesn't have access to a site at all, and redirects to the 'all sites'
		// version of that URL. We don't want to render anything right now, so continue redirecting to my-sites.
		if ( ! route.getSiteFragment( currentRoute ) ) {
			this.redirect();
			return null;
		}

		if ( ! siteId ) {
			return null;
		}

		if ( 'wpcalypso' !== config( 'env_id' ) && 'development' !== config( 'env_id' ) ) {
			// Show stats page for non Atomic sites for now
			if ( ! isAtomicSite ) {
				this.redirect();
				return null;
			}

			if ( ! canUserManageOptions ) {
				this.redirect();
				return null;
			}
		}

		const className = 'woocommerce';
		return (
			<div className={ className }>
				{ children }
			</div>
		);
	}

}

function mapStateToProps( state ) {
	const siteId = getSelectedSiteId( state );
	const canUserManageOptions = siteId && canCurrentUser( state, siteId, 'manage_options' ) || false;
	const isAtomicSite = siteId && !! isSiteAutomatedTransfer( state, siteId ) || false;
	return {
		siteId,
		canUserManageOptions,
		isAtomicSite,
		currentRoute: page.current,
	};
}

export default connect( mapStateToProps )( App );
