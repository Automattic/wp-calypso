/**
 * External dependencies
 */
import React from 'react';
import page from 'page';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import Header from 'my-sites/domains/domain-management/components/header';
import { domainManagementEdit } from 'my-sites/domains/paths';
import { CompactCard } from '@automattic/components';
import MaterialIcon from 'components/material-icon';
import { getSelectedDomain } from 'lib/domains';
import RenewButton from 'my-sites/domains/domain-management/edit/card/renew-button';
import QuerySitePurchases from 'components/data/query-site-purchases';
import { getProductBySlug } from 'state/products-list/selectors';
import {
	getByPurchaseId,
	isFetchingSitePurchases,
	hasLoadedSitePurchasesFromServer,
} from 'state/purchases/selectors';

import './style.scss';

const SSL_DISABLED = 'disabled';
const SSL_PROVISIONING = 'provisioning';
const SSL_ACTIVE = 'active';

class Security extends React.Component {
	header() {
		return (
			<Header onClick={ this.back } selectedDomainName={ this.props.selectedDomainName }>
				{ this.props.translate( 'Domain security' ) }
			</Header>
		);
	}

	back = () => {
		page( domainManagementEdit( this.props.selectedSite.slug, this.props.selectedDomainName ) );
	};

	getSSLStatus( domain ) {
		const { expired, sslProvisioning } = domain;

		if ( expired ) {
			return SSL_DISABLED;
		}

		if ( sslProvisioning ) {
			return SSL_PROVISIONING;
		}

		return SSL_ACTIVE;
	}

	getSSLStatusIcon( domain ) {
		const { translate } = this.props;

		const sslStatus = this.getSSLStatus( domain );
		let icon, text;

		switch ( sslStatus ) {
			case SSL_PROVISIONING:
				text = translate( 'Provisioning' );
				break;
			case SSL_ACTIVE:
				icon = 'check_circle';
				text = translate( 'Enabled' );
				break;
			case SSL_DISABLED:
				icon = 'info';
				text = translate( 'Disabled' );
				break;
		}

		const statusClassNames = classNames( 'security__status', sslStatus );

		return (
			<span className={ statusClassNames }>
				{ icon && <MaterialIcon icon={ icon } /> }
				{ text }
			</span>
		);
	}

	getStatusDescription( domain ) {
		const { selectedSite, purchase, translate } = this.props;
		const sslStatus = this.getSSLStatus( domain );

		if ( SSL_PROVISIONING === sslStatus ) {
			return (
				<p>
					{ translate(
						'Due to some changes to your domain, we need to generate a new SSL certificate to activate your HTTPS encryption. This process should only take a couple hours at most so if you’re running into delays please let us know so we can help you out.'
					) }
				</p>
			);
		}

		if ( SSL_DISABLED === sslStatus ) {
			return (
				<React.Fragment>
					<p>
						{ translate(
							'We have disabled HTTPS encryption because your domain has expired and is no longer active. Renew your domain to reactivate it and turn on HTTPS encryption.'
						) }
					</p>
					{ selectedSite.ID && ! purchase && <QuerySitePurchases siteId={ selectedSite.ID } /> }
					<RenewButton
						primary={ true }
						purchase={ purchase }
						selectedSite={ selectedSite }
						subscriptionId={ parseInt( domain.subscriptionId, 10 ) }
						redemptionProduct={ domain.isRedeemable ? this.props.redemptionProduct : null }
						reactivate={ ! domain.isRenewable && domain.isRedeemable }
						tracksProps={ { source: 'security-status', domain_status: 'expired' } }
					/>
				</React.Fragment>
			);
		}

		return (
			<React.Fragment>
				<p>
					{ translate(
						'Strong encryption is critical to ensure the privacy and security of your site. This is what you get with HTTPS encryption on WordPress.com:'
					) }
				</p>
				<ul>
					{ [
						translate( 'Trust indicators that reassure your visitors your site is safe ' ),
						translate( 'Secure data transmission of data sent through forms' ),
						translate( 'Safe shopping experience with secure payments' ),
						translate( 'Protection against hackers trying to mimic your site' ),
						translate( 'Improved Google search rankings' ),
						translate( '301 redirects for all HTTP requests to HTTPS' ),
					].map( ( feature, index ) => (
						<li key={ index }>{ feature }</li>
					) ) }
				</ul>
			</React.Fragment>
		);
	}

	getContent() {
		const { domain, translate } = this.props;

		if ( ! domain ) {
			return null;
		}

		return (
			<React.Fragment>
				<CompactCard className="security__header">
					<span>{ translate( 'HTTPS encryption' ) }</span>
					{ this.getSSLStatusIcon( domain ) }
				</CompactCard>
				<CompactCard className="security__content">
					{ this.getStatusDescription( domain ) }
				</CompactCard>
			</React.Fragment>
		);
	}

	render() {
		return (
			<Main className="security">
				{ this.header() }
				{ this.getContent() }
			</Main>
		);
	}
}

export default connect( ( state, ownProps ) => {
	const domain = ownProps.domains && getSelectedDomain( ownProps );
	const { subscriptionId } = domain;

	return {
		domain,
		purchase: subscriptionId ? getByPurchaseId( state, parseInt( subscriptionId, 10 ) ) : null,
		isLoadingPurchase:
			isFetchingSitePurchases( state ) && ! hasLoadedSitePurchasesFromServer( state ),
		redemptionProduct: getProductBySlug( state, 'domain_redemption' ),
	};
} )( localize( Security ) );
