/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import page from 'page';

/**
 * Internal dependencies
 */
import wp from 'calypso/lib/wp';
import EmptyContent from 'calypso/components/empty-content';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { getManagePurchaseUrlFor } from 'calypso/my-sites/purchases/paths';
import { emailManagementNewTitanAccount } from 'calypso/my-sites/email/paths';
import getSitesItems from 'calypso/state/selectors/get-sites-items';
import { getSiteSlug, hasAllSitesList } from 'calypso/state/sites/selectors';
import { SUPPORT_ROOT } from 'calypso/lib/url/support';
import { addQueryArgs } from 'calypso/lib/route';
import { login } from 'calypso/lib/paths';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import { getTitanProductName } from 'calypso/lib/titan';
import QuerySites from 'calypso/components/data/query-sites';

class TitanRedirector extends Component {
	state = {
		loaded: false,
		hasError: false,
		action: null,
		subscriptionId: null,
		blogId: null,
		domain: null,
	};

	componentDidMount() {
		const { mode, jwt, isLoggedIn } = this.props;

		if ( ! isLoggedIn ) {
			return;
		}

		wp.undocumented()
			.getTitanDetailsForIncomingRedirect( mode, jwt )
			.then(
				( data ) => {
					this.setState( {
						hasError: false,
						loaded: true,
						action: data?.action,
						subscriptionId: data?.subscription_id,
						blogId: data?.blog_id,
						domain: data?.domain,
					} );
				},
				() => {
					this.setState( {
						hasError: true,
						loaded: true,
					} );
				}
			);
	}

	render() {
		const {
			translate,
			isLoggedIn,
			siteSlugs,
			currentQuery,
			currentRoute,
			hasAllSitesLoaded,
		} = this.props;
		const { loaded, hasError, action, domain, blogId, subscriptionId } = this.state;

		if ( ! isLoggedIn ) {
			const redirectTo = currentQuery ? addQueryArgs( currentQuery, currentRoute ) : currentRoute;
			return (
				<EmptyContent
					title={ translate( 'You need to be logged in WordPress.com to open this page' ) }
					action={ translate( 'Log In' ) }
					actionURL={ login( { redirectTo } ) }
				/>
			);
		}

		if ( ! loaded || ! hasAllSitesLoaded ) {
			return (
				<>
					{ ! hasAllSitesLoaded && <QuerySites allSites={ true } /> }

					<EmptyContent title={ translate( 'Redirecting…' ) } />
				</>
			);
		}

		if ( loaded && hasError ) {
			return (
				<EmptyContent
					title={ translate( "We couldn't process your link" ) }
					line={ translate(
						"We can't work out where this link is supposed to go. Can you check the website that sent you?"
					) }
					action={ translate( 'Contact support' ) }
					actionURL={ SUPPORT_ROOT }
				/>
			);
		}

		if ( ! subscriptionId || ! blogId ) {
			return (
				<EmptyContent
					title={ translate( "We couldn't locate your account details" ) }
					line={ translate(
						'Please check that you purchased the %(titanProductName)s subscription, as only the original purchaser can manage billing and add more accounts',
						{
							args: {
								titanProductName: getTitanProductName(),
							},
							comment:
								'%(titanProductName) is the name of the product, which should be "Professional Email" translated',
						}
					) }
					action={ translate( 'Contact support' ) }
					actionURL={ SUPPORT_ROOT }
				/>
			);
		}

		const siteSlug = siteSlugs[ blogId ];

		let redirectURL;

		switch ( action ) {
			case 'renewOrder':
			case 'billing':
			case 'upgradePlan':
				redirectURL = getManagePurchaseUrlFor( siteSlug, subscriptionId );
				break;
			case 'buyMoreAccounts':
				redirectURL = emailManagementNewTitanAccount( siteSlug, domain );
				break;
		}

		if ( ! redirectURL ) {
			return (
				<EmptyContent
					title={ translate( 'Unexpected request' ) }
					line={ translate(
						"We received a request for %(action)s but we don't know how to handle that",
						{ args: { action } }
					) }
					action={ translate( 'Contact support' ) }
					actionURL={ SUPPORT_ROOT }
				/>
			);
		}

		page.redirect( redirectURL );

		return null;
	}
}

export default connect( ( state ) => {
	const sitesItems = getSitesItems( state );

	// eslint-disable-next-line wpcalypso/redux-no-bound-selectors
	const siteSlugPairs = Object.values( sitesItems ).map( ( site ) => {
		return [ site.ID, getSiteSlug( state, site.ID ) ];
	} );

	return {
		isLoggedIn: isUserLoggedIn( state ),
		siteSlugs: Object.fromEntries( siteSlugPairs ),
		currentQuery: getCurrentQueryArguments( state ),
		currentRoute: getCurrentRoute( state ),
		hasAllSitesLoaded: hasAllSitesList( state ),
	};
} )( localize( TitanRedirector ) );
