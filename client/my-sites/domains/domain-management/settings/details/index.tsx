import { Button } from '@automattic/components';
import formatCurrency from '@automattic/format-currency';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import Accordion from 'calypso/components/domains/accordion';
import { withLocalizedMoment } from 'calypso/components/localized-moment';
import { isExpiring } from 'calypso/lib/purchases';
import AutoRenewToggle from 'calypso/me/purchases/manage-purchase/auto-renew-toggle';
import { recordPaymentSettingsClick } from 'calypso/my-sites/domains/domain-management/edit/payment-settings-analytics';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import { getProductBySlug } from 'calypso/state/products-list/selectors';
import {
	getByPurchaseId,
	isFetchingSitePurchases,
	hasLoadedSitePurchasesFromServer,
} from 'calypso/state/purchases/selectors';
import getSiteIsDomainOnly from 'calypso/state/selectors/is-domain-only-site';
import * as React from 'react';
import { connect } from 'react-redux';
import { useTranslate } from 'i18n-calypso';
import { handleRenewNowClick, getRenewalPrice } from 'calypso/lib/purchases';

const noop = () => {};

const Details = ( props ) => {
	const translate = useTranslate();

	console.log( props );
	console.log( '=====' );

	const renderRegisteredUntil = () => {
		return props.moment( props.domain.expiry ).format( 'LL' );
	};

	const renderRegisteredOn = () => {
		return props.moment( props.domain.registration_date ).format( 'LL' );
	};

	const renderAutoRenewToggle = () => {
		if ( ! props.purchase ) {
			return null;
		}

		let formattedPrice = '';

		if ( props.purchase && props.selectedSite.ID ) {
			const renewalPrice =
				getRenewalPrice( props.purchase ) +
				( props.redemptionProduct ? props.redemptionProduct.cost : 0 );
			const currencyCode = props.purchase.currencyCode;
			formattedPrice = formatCurrency( renewalPrice, currencyCode, { stripZeros: true } );
		}

		const autoRenewAdditionalText = ! isExpiring( props.purchase )
			? translate( 'We will attempt to renew on %(renewalDate)s for %(price)s', {
					args: {
						renewalDate: props.moment( props.domain.autoRenewalDate ).format( 'LL' ),
						price: formattedPrice,
					},
			  } )
			: null;

		return (
			<div>
				<AutoRenewToggle
					planName={ props.selectedSite.plan.product_name_short }
					siteDomain={ props.selectedSite.domain }
					purchase={ props.purchase }
					withTextStatus={ true }
					toggleSource="registered-domain-status"
				/>
				{ autoRenewAdditionalText && <span>{ autoRenewAdditionalText } </span> }
			</div>
		);
	};

	const renderRegisteredDomainInfo = () => {
		return (
			<React.Fragment>
				<div>
					<div>
						<div>Registered until</div>
						<div>{ renderRegisteredUntil() }</div>
					</div>
					<div>
						<div>Registered on</div>
						<div>{ renderRegisteredOn() }</div>
					</div>
				</div>
				<div>{ renderAutoRenewToggle() }</div>
				<div>
					<Button onClick={ noop }>Renew now</Button>
					<Button onClick={ noop }>Payment details</Button>
				</div>
			</React.Fragment>
		);
	};

	const renderMainInfo = () => {
		// TODO: If it's a registered domain or transfer and the domain's registrar is in maintenance, show maintenance card
		const { selectedSite } = props;

		return (
			<>
				{ selectedSite.ID && ! props.purchase && <QuerySitePurchases siteId={ selectedSite.ID } /> }
				<Accordion
					title={ translate( 'Details' ) }
					subtitle={ translate( 'Registration and auto-renew' ) }
					expanded
				>
					{ renderRegisteredDomainInfo() }
				</Accordion>
			</>
		);
	};

	return renderMainInfo();
};

export default connect(
	( state, ownProps ) => {
		const { subscriptionId } = ownProps.domain;
		const currentUserId = getCurrentUserId( state );
		const purchase = subscriptionId
			? getByPurchaseId( state, parseInt( subscriptionId, 10 ) )
			: null;

		return {
			isDomainOnlySite: getSiteIsDomainOnly( state, ownProps.selectedSite.ID ),
			isLoadingPurchase:
				isFetchingSitePurchases( state ) || ! hasLoadedSitePurchasesFromServer( state ),
			purchase: purchase && purchase.userId === currentUserId ? purchase : null,
			redemptionProduct: getProductBySlug( state, 'domain_redemption' ),
		};
	},
	{
		recordPaymentSettingsClick,
	}
)( withLocalizedMoment( Details ) );
