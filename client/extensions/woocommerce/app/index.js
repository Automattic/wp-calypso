/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import page from 'page';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import DocumentHead from 'components/data/document-head';
import config from 'config';
import route from 'lib/route';
import { canCurrentUser } from 'state/selectors';
import { isSiteAutomatedTransfer } from 'state/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';

class App extends Component {

	static propTypes = {
		siteId: PropTypes.number,
		documentTitle: PropTypes.string,
		canUserManageOptions: PropTypes.bool.isRequired,
		currentRoute: PropTypes.string.isRequired,
		isAtomicSite: PropTypes.bool.isRequired,
		children: PropTypes.element.isRequired,
	};

	componentWillReceiveProps( newProps ) {
		if ( this.props.children !== newProps.children ) {
			window.scrollTo( 0, 0 );
		}
	}

	redirect = () => {
		window.location.href = '/stats/day';
	}

	render = () => {
		const { siteId, children, canUserManageOptions, isAtomicSite, currentRoute, translate } = this.props;

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
			if ( ! isAtomicSite && ! config.isEnabled( 'woocommerce/store-on-non-atomic-sites' ) ) {
				this.redirect();
				return null;
			}

			if ( ! canUserManageOptions ) {
				this.redirect();
				return null;
			}
		}

		const documentTitle = this.props.documentTitle || translate( 'Store' );

		const className = 'woocommerce';
		return (
			<div className={ className }>
				<DocumentHead title={ documentTitle } />
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

export default connect( mapStateToProps )( localize( App ) );
