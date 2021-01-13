/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import page from 'page';
import { map, fromPairs } from 'lodash-es';

/**
 * Internal dependencies
 */
import wp from 'calypso/lib/wp';
import EmptyContent from 'calypso/components/empty-content';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { getManagePurchaseUrlFor } from 'calypso/my-sites/purchases/paths';
import { emailManagementNewTitanAccount } from 'calypso/my-sites/email/paths';
import getSitesItems from 'calypso/state/selectors/get-sites-items';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { SUPPORT_ROOT } from 'calypso/lib/url/support';
import { addQueryArgs } from 'calypso/lib/route';
import { login } from 'calypso/lib/paths';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';

class TitanRedirector extends Component {
	state = {
		loaded: false,
		hasError: false,
		action: null,
		orderId: null,
		subscriptionId: null,
		blogId: null,
		domain: null,
		error: null,
	};

	componentDidMount() {
		const { mode, jwt, isLoggedIn } = this.props;

		if ( ! isLoggedIn ) {
			return;
		}

		wp.undocumented()
			.getTitanIncomingURL( mode, jwt )
			.then(
				( data ) => {
					this.setState( {
						hasError: false,
						loaded: true,
						action: data?.action,
						orderId: data?.order_id,
						subscriptionId: data?.subscription_id,
						blogId: data?.blog_id,
						domain: data?.domain,
					} );
				},
				( error ) => {
					this.setState( {
						hasError: true,
						loaded: true,
						error: error?.message,
					} );
				}
			);
	}

	render() {
		const { translate, isLoggedIn, siteSlugs, currentQuery, currentRoute } = this.props;
		const { loaded, hasError, error, action, domain, blogId, subscriptionId } = this.state;

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

		if ( ! loaded ) {
			return <EmptyContent title={ translate( 'Redirecting…' ) } />;
		}

		if ( loaded && hasError ) {
			return (
				<EmptyContent
					title={ translate( 'An error occurred when decoding your request' ) }
					line={ error }
					action={ translate( 'Contact support' ) }
					actionURL={ SUPPORT_ROOT }
				/>
			);
		}

		if ( ! subscriptionId || ! blogId ) {
			return (
				<EmptyContent
					title={ translate( 'No subscription found' ) }
					line={ translate( 'Are you logged in with the appropriate user?' ) }
					action={ translate( 'Contact support' ) }
					actionURL={ SUPPORT_ROOT }
				/>
			);
		}

		const siteSlug = siteSlugs[ blogId ];

		let redirectURL;

		switch ( action ) {
			case 'billing':
				redirectURL = getManagePurchaseUrlFor( siteSlug, subscriptionId );
				break;
			case 'buyMoreAccounts':
				redirectURL = emailManagementNewTitanAccount( siteSlug, domain );
				break;
		}

		if ( ! redirectURL ) {
			return (
				<EmptyContent
					title={ translate( 'Unknown request' ) }
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
	}
}

export default connect( ( state ) => {
	const sitesItems = getSitesItems( state );

	// eslint-disable-next-line wpcalypso/redux-no-bound-selectors
	const siteSlugPairs = map( sitesItems, ( site ) => {
		return [ site.ID, getSiteSlug( state, site.ID ) ];
	} );

	return {
		isLoggedIn: isUserLoggedIn( state ),
		siteSlugs: fromPairs( siteSlugPairs ),
		currentQuery: getCurrentQueryArguments( state ),
		currentRoute: getCurrentRoute( state ),
	};
} )( localize( TitanRedirector ) );
