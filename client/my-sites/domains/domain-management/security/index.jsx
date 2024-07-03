import { recordTracksEvent } from '@automattic/calypso-analytics';
import page from '@automattic/calypso-router';
import { CompactCard, MaterialIcon } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { ECOMMERCE, FORMS } from '@automattic/urls';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import Main from 'calypso/components/main';
import SupportButton from 'calypso/components/support-button';
import VerticalNav from 'calypso/components/vertical-nav';
import VerticalNavItem from 'calypso/components/vertical-nav/item';
import { getSelectedDomain } from 'calypso/lib/domains';
import { sslStatuses } from 'calypso/lib/domains/constants';
import DomainMainPlaceholder from 'calypso/my-sites/domains/domain-management/components/domain/main-placeholder';
import Header from 'calypso/my-sites/domains/domain-management/components/header';
import RenewButton from 'calypso/my-sites/domains/domain-management/edit/card/renew-button';
import { domainManagementEdit } from 'calypso/my-sites/domains/paths';
import { getProductBySlug } from 'calypso/state/products-list/selectors';
import {
	getByPurchaseId,
	isFetchingSitePurchases,
	hasLoadedSitePurchasesFromServer,
} from 'calypso/state/purchases/selectors';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';

import './style.scss';

class Security extends Component {
	header() {
		return (
			<Header onClick={ this.back } selectedDomainName={ this.props.selectedDomainName }>
				{ this.props.translate( 'Domain security' ) }
			</Header>
		);
	}

	back = () => {
		page(
			domainManagementEdit(
				this.props.selectedSite.slug,
				this.props.selectedDomainName,
				this.props.currentRoute
			)
		);
	};

	getSSLStatusIcon( domain ) {
		const { translate } = this.props;

		const { sslStatus } = domain;
		let icon;
		let text;

		switch ( sslStatus ) {
			case sslStatuses.SSL_PENDING:
				text = translate( 'Provisioning' );
				break;
			case sslStatuses.SSL_ACTIVE:
				icon = 'check_circle';
				text = translate( 'Enabled' );
				break;
			case sslStatuses.SSL_DISABLED:
				icon = 'info';
				text = translate( 'Disabled' );
				break;
		}

		const statusClassNames = clsx( 'security__status', sslStatus );

		return (
			<span className={ statusClassNames }>
				{ icon && <MaterialIcon icon={ icon } /> }
				{ text }
			</span>
		);
	}

	getStatusDescription( domain ) {
		const { selectedSite, purchase, translate } = this.props;
		const { sslStatus } = domain;

		if ( sslStatuses.SSL_PENDING === sslStatus ) {
			return (
				<Fragment>
					<p>
						{ translate(
							'Due to some changes to your domain, we need to generate a new SSL certificate to activate your HTTPS encryption. This process should only take a couple hours at most. If you’re running into delays please let us know so we can help you out.'
						) }
					</p>
					<SupportButton skipToContactOptions>{ translate( 'Contact support' ) }</SupportButton>
				</Fragment>
			);
		}

		if ( sslStatuses.SSL_DISABLED === sslStatus ) {
			return (
				<Fragment>
					<p>
						{ translate(
							'We have disabled HTTPS encryption because your domain has expired and is no longer active. Renew your domain to reactivate it and turn on HTTPS encryption.'
						) }
					</p>
					{ selectedSite.ID && ! purchase && <QuerySitePurchases siteId={ selectedSite.ID } /> }
					<RenewButton
						primary
						purchase={ purchase }
						selectedSite={ selectedSite }
						subscriptionId={ parseInt( domain.subscriptionId, 10 ) }
						redemptionProduct={ domain.isRedeemable ? this.props.redemptionProduct : null }
						reactivate={ ! domain.isRenewable && domain.isRedeemable }
						tracksProps={ { source: 'security-status', domain_status: 'expired' } }
					/>
				</Fragment>
			);
		}

		return (
			<Fragment>
				<p>
					{ translate(
						'Strong encryption is critical to ensure the privacy and security of your site. This is what you get with HTTPS encryption on WordPress.com:'
					) }
				</p>
				<ul>
					{ [
						translate( 'Trust indicators that reassure your visitors your site is safe ' ),
						translate( 'Secure data transmission for all your forms' ),
						translate( 'Safe shopping experience with secure payments' ),
						translate( 'Protection against hackers trying to mimic your site' ),
						translate( 'Improved Google search rankings' ),
						translate( '301 redirects for all HTTP requests to HTTPS' ),
					].map( ( feature, index ) => (
						<li key={ index }>{ feature }</li>
					) ) }
				</ul>
			</Fragment>
		);
	}

	handleLearnMoreClicks = ( event ) => {
		this.props.recordTracksEvent( 'calypso_domain_security_learn_more_click', {
			path: event.currentTarget.href,
		} );
	};

	getContent() {
		const { domain, translate } = this.props;
		const { sslStatus } = domain;
		return (
			<Fragment>
				<CompactCard className="security__header">
					<span>{ translate( 'HTTPS encryption' ) }</span>
					{ this.getSSLStatusIcon( domain ) }
				</CompactCard>
				<CompactCard className="security__content">
					{ this.getStatusDescription( domain ) }
				</CompactCard>
				{ sslStatuses.SSL_ACTIVE === sslStatus && (
					<VerticalNav>
						<VerticalNavItem
							path={ localizeUrl( ECOMMERCE ) }
							onClick={ this.handleLearnMoreClicks }
							external
						>
							{ translate( 'Learn more about selling products on WordPress.com' ) }
						</VerticalNavItem>
						<VerticalNavItem
							path={ localizeUrl( FORMS ) }
							onClick={ this.handleLearnMoreClicks }
							external
						>
							{ translate( 'Learn more about forms on WordPress.com' ) }
						</VerticalNavItem>
					</VerticalNav>
				) }
			</Fragment>
		);
	}

	render() {
		const { domain } = this.props;

		if ( ! domain ) {
			return <DomainMainPlaceholder goBack={ this.back } />;
		}

		return (
			<Main className="security">
				{ this.header() }
				{ this.getContent() }
			</Main>
		);
	}
}

export default connect(
	( state, ownProps ) => {
		const domain = ownProps.domains && getSelectedDomain( ownProps );
		const { subscriptionId } = domain || {};

		return {
			currentRoute: getCurrentRoute( state ),
			domain,
			purchase: subscriptionId ? getByPurchaseId( state, parseInt( subscriptionId, 10 ) ) : null,
			isLoadingPurchase:
				isFetchingSitePurchases( state ) && ! hasLoadedSitePurchasesFromServer( state ),
			redemptionProduct: getProductBySlug( state, 'domain_redemption' ),
		};
	},
	{
		recordTracksEvent,
	}
)( localize( Security ) );
