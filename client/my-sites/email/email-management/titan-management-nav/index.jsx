/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import {
	emailManagementManageTitanAccount,
	emailManagementNewTitanAccount,
} from 'calypso/my-sites/email/paths';
import { errorNotice } from 'calypso/state/notices/actions';
import { fetchTitanAutoLoginURL } from 'calypso/my-sites/email/email-management/titan-functions';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import { getManagePurchaseUrlFor } from 'calypso/my-sites/purchases/paths';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { getTitanMailOrderId } from 'calypso/lib/titan/get-titan-mail-order-id';
import { isEnabled } from 'calypso/config';
import SectionHeader from 'calypso/components/section-header';
import VerticalNav from 'calypso/components/vertical-nav';
import VerticalNavItem from 'calypso/components/vertical-nav/item';
import { getTitanProductName } from 'calypso/lib/titan/get-titan-product-name';

/**
 * Style
 */
import './style.scss';

class TitanManagementNav extends React.Component {
	static propTypes = {
		domain: PropTypes.object.isRequired,
	};

	constructor( props ) {
		super( props );
		this.state = {
			isFetchingExternalManagementUrl: this.shouldFetchControlPanelLink(),
			externalManagementUrl: '',
		};
	}

	shouldFetchControlPanelLink() {
		return ! isEnabled( 'titan/iframe-control-panel' );
	}

	componentDidMount() {
		this._mounted = true;

		if ( this.shouldFetchControlPanelLink() ) {
			const { domain, translate } = this.props;

			fetchTitanAutoLoginURL( getTitanMailOrderId( domain ) ).then( ( { error, loginURL } ) => {
				if ( this._mounted ) {
					this.setState( { isFetchingExternalManagementUrl: false } );
				}
				if ( error ) {
					this.props.errorNotice(
						error ?? translate( 'An unknown error occurred. Please try again later.' )
					);
				} else if ( this._mounted ) {
					this.setState( { externalManagementUrl: loginURL } );
				}
			} );
		}
	}

	componentWillUnmount() {
		this._mounted = false;
	}

	renderTitanManagementLink = () => {
		const { currentRoute, domain, selectedSiteSlug, translate } = this.props;
		const linkTitle = translate( 'Manage your email settings and accounts' );
		if ( isEnabled( 'titan/iframe-control-panel' ) ) {
			return (
				<VerticalNavItem
					path={ emailManagementManageTitanAccount( selectedSiteSlug, domain.name, currentRoute ) }
				>
					{ linkTitle }
				</VerticalNavItem>
			);
		}
		const { externalManagementUrl, isFetchingExternalManagementUrl } = this.state;
		if ( ! externalManagementUrl || isFetchingExternalManagementUrl ) {
			return <VerticalNavItem isPlaceholder={ true } />;
		}
		return (
			<VerticalNavItem path={ externalManagementUrl } external={ true }>
				{ linkTitle }
			</VerticalNavItem>
		);
	};

	renderPurchaseManagementLink = () => {
		const { domain, selectedSiteSlug, translate } = this.props;
		if ( ! domain?.titanMailSubscription?.subscriptionId ) {
			return null;
		}

		return (
			<VerticalNavItem
				path={ getManagePurchaseUrlFor(
					selectedSiteSlug,
					domain.titanMailSubscription.subscriptionId
				) }
			>
				{ translate( 'Update your billing and payment settings' ) }
			</VerticalNavItem>
		);
	};

	renderAddMailboxesLink = () => {
		const { currentRoute, domain, selectedSiteSlug, translate } = this.props;
		// If we don't have a subscription, we can't add mailboxes.
		if ( ! domain?.titanMailSubscription?.subscriptionId ) {
			return null;
		}

		return (
			<VerticalNavItem
				path={ emailManagementNewTitanAccount( selectedSiteSlug, domain.name, currentRoute ) }
			>
				{ translate( 'Add more mailboxes' ) }
			</VerticalNavItem>
		);
	};

	render() {
		const { domain, translate } = this.props;
		const headerLabel = translate( '%(productName)s: %(domainName)s', {
			args: {
				domainName: domain.name,
				productName: getTitanProductName(),
			},
			comment:
				'%(domainName)s is a domain name, e.g. example.com; %(productName)s is the product name, either "Email" or "Titan Mail"',
		} );
		return (
			<div className="titan-management-nav">
				<SectionHeader label={ headerLabel } />
				<VerticalNav>
					{ this.renderTitanManagementLink() }
					{ this.renderPurchaseManagementLink() }
					{ this.renderAddMailboxesLink() }
				</VerticalNav>
			</div>
		);
	}
}

export default connect(
	( state ) => {
		return {
			currentRoute: getCurrentRoute( state ),
			selectedSiteSlug: getSelectedSiteSlug( state ),
		};
	},
	( dispatch ) => {
		return {
			errorNotice: ( text, options ) => dispatch( errorNotice( text, options ) ),
		};
	}
)( localize( TitanManagementNav ) );
