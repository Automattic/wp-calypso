/* eslint-disable wpcalypso/jsx-classname-namespace */

import { Button } from '@automattic/components';
import formatCurrency from '@automattic/format-currency';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import Accordion from 'calypso/components/domains/accordion';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { isExpiringSoon } from 'calypso/lib/domains/utils';
import { getRenewalPrice, isExpiring } from 'calypso/lib/purchases';
import AutoRenewToggle from 'calypso/me/purchases/manage-purchase/auto-renew-toggle';
import RenewButton from 'calypso/my-sites/domains/domain-management/edit/card/renew-button';
import { getManagePurchaseUrlFor } from 'calypso/my-sites/purchases/paths';
import { getProductBySlug } from 'calypso/state/products-list/selectors';
import type { DetailsCardProps } from './types';

import './style.scss';

const Details = ( { domain, isLoadingPurchase, purchase, selectedSite }: DetailsCardProps ) => {
	const moment = useLocalizedMoment();
	const translate = useTranslate();
	const redemptionProduct = useSelector( ( state ) =>
		getProductBySlug( state, 'domain_redemption' )
	);

	const renderDates = () => {
		return (
			<>
				<div className="details-card__date">
					<div className="details-card__date-label">Registered until</div>
					<div>{ moment( domain.expiry ).format( 'LL' ) }</div>
				</div>
				<div className="details-card__date">
					<div className="details-card__date-label">Registered on</div>
					<div>{ moment( domain.registrationDate ).format( 'LL' ) }</div>
				</div>
			</>
		);
	};

	const renderAutoRenewToggle = () => {
		if ( ! domain.currentUserCanManage ) {
			return null;
		}

		if ( isLoadingPurchase ) {
			return <p className="details-card__autorenew-placeholder" />;
		}

		if ( ! purchase ) {
			return null;
		}

		let formattedPrice = '';

		if ( purchase && selectedSite.ID ) {
			const renewalPrice =
				getRenewalPrice( purchase ) + ( redemptionProduct ? redemptionProduct.cost : 0 );
			const currencyCode = purchase.currencyCode;
			formattedPrice = formatCurrency( renewalPrice, currencyCode, { stripZeros: true } );
		}

		const autoRenewAdditionalText = ! isExpiring( purchase ) // is this the right way to test if auto-renew is turned on?
			? translate( 'We will attempt to renew on %(renewalDate)s for %(price)s', {
					args: {
						renewalDate: moment( domain.autoRenewalDate ).format( 'LL' ),
						price: formattedPrice,
					},
			  } )
			: null;

		return (
			<>
				<AutoRenewToggle
					planName={ selectedSite.plan.product_name_short }
					siteDomain={ selectedSite.domain }
					purchase={ purchase }
					withTextStatus={ true }
					toggleSource="registered-domain-status"
				/>
				{ autoRenewAdditionalText && (
					<span className="details-card__autorenew-text">{ autoRenewAdditionalText } </span>
				) }
			</>
		);
	};

	const renderRenewButton = () => {
		if ( domain.isPendingRenewal ) {
			return null;
		}

		if ( ! domain.currentUserCanManage ) {
			return null;
		}

		if ( domain.expired || isExpiringSoon( domain, 30 ) ) {
			return null;
		}

		if ( ! isLoadingPurchase && ! purchase ) {
			return null;
		}

		return (
			<RenewButton
				purchase={ purchase }
				selectedSite={ selectedSite }
				subscriptionId={ parseInt( domain.subscriptionId, 10 ) }
				tracksProps={ { source: 'registered-domain-status', domain_status: 'active' } }
				customLabel={ translate( 'Renew now' ) }
				disabled={ isLoadingPurchase }
			/>
		);
	};

	const renderPaymentDetailsButton = () => {
		return (
			<Button href={ getManagePurchaseUrlFor( selectedSite.slug, domain.subscriptionId ) }>
				{ translate( 'Payment details' ) }
			</Button>
		);
	};

	const renderRegisteredDomainInfo = () => {
		return (
			<div className="details-card">
				<div className="details-card__section dates">{ renderDates() }</div>
				<div className="details-card__section">{ renderAutoRenewToggle() }</div>
				<div className="details-card__section">
					{ renderRenewButton() }
					{ renderPaymentDetailsButton() }
				</div>
			</div>
		);
	};

	// TODO: If it's a registered domain or transfer and the domain's registrar is in maintenance, show maintenance card
	return (
		<>
			{ selectedSite.ID && ! purchase && <QuerySitePurchases siteId={ selectedSite.ID } /> }
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

export default Details;
