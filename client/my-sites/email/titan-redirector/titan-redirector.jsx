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
		const { translate, isLoggedIn, siteSlugs } = this.props;
		const { loaded, hasError, error, action, domain, blogId, subscriptionId } = this.state;

		if ( ! isLoggedIn ) {
			return (
				<EmptyContent
					title={ translate( 'You need to be logged in WordPress.com to open this page' ) }
					action={ 'whaat' }
				/>
			);
		}

		if ( ! loaded ) {
			return <EmptyContent title={ translate( 'Loading…' ) } />;
		}

		if ( loaded && hasError ) {
			return (
				<EmptyContent
					title={ translate( 'An error occurred when decoding your request' ) }
					line={ error }
				/>
			);
		}

		if ( ! subscriptionId || ! blogId ) {
			return <EmptyContent title={ translate( 'No subscription found' ) } />;
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
					title={ translate( 'There is a problem with this page' ) }
					line={ translate( 'Please contact our support team' ) }
				/>
			);
		}

		return (
			<div>
				You'll be redirected to: <a href={ redirectURL }>{ redirectURL }</a>
			</div>
		);

		// eslint-disable-next-line no-constant-condition,no-unreachable
		if ( false ) {
			page.redirect( redirectURL );
		}
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
	};
} )( localize( TitanRedirector ) );
