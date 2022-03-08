/* eslint-disable wpcalypso/jsx-classname-namespace */

import { Button } from '@automattic/components';
import formatCurrency from '@automattic/format-currency';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { isExpiringSoon } from 'calypso/lib/domains/utils';
import { getRenewalPrice, isExpiring } from 'calypso/lib/purchases';
import AutoRenewToggle from 'calypso/me/purchases/manage-purchase/auto-renew-toggle';
import RenewButton from 'calypso/my-sites/domains/domain-management/edit/card/renew-button';
import { getManagePurchaseUrlFor } from 'calypso/my-sites/purchases/paths';
import { getProductBySlug } from 'calypso/state/products-list/selectors';
import type { DetailsCardProps } from './types';

import './style.scss';

const RegisteredDomainDetails = ( {
	domain,
	isLoadingPurchase,
	purchase,
	selectedSite,
}: DetailsCardProps ): JSX.Element => {
	const moment = useLocalizedMoment();
	const translate = useTranslate();
	const redemptionProduct = useSelector( ( state ) =>
		getProductBySlug( state, 'domain_redemption' )
	);

	const renderDates = () => {
		const untilDateLabel = domain.expired
			? // translators: this is followed by a date, e.g. Expired on December 15, 2021
			  translate( 'Expired on' )
			: // translators: this is followed by a date, e.g. Registered until January 21, 2023
			  translate( 'Registered until' );

		return (
			<>
				<div className="details-card__date">
					<div className="details-card__date-label">{ untilDateLabel }</div>
					<div>{ moment( domain.expiry ).format( 'LL' ) }</div>
				</div>
				<div className="details-card__date">
					{ /* translators: this is followed by a date, e.g. Registered on November 15, 2021 */ }
					<div className="details-card__date-label">{ translate( 'Registered on' ) }</div>
					<div>{ moment( domain.registrationDate ).format( 'LL' ) }</div>
				</div>
			</>
		);
	};

	const shouldNotRenderAutoRenewToggle = () => {
		return (
			! domain.currentUserCanManage ||
			( ! isLoadingPurchase && ! purchase ) ||
			domain.aftermarketAuction
		);
	};

	const renderAutoRenewToggle = () => {
		if ( shouldNotRenderAutoRenewToggle() ) {
			return null;
		}

		if ( isLoadingPurchase ) {
			return <p className="details-card__autorenew-placeholder" />;
		}

		let formattedPrice = '';

		if ( purchase && selectedSite.ID ) {
			const renewalPrice =
				getRenewalPrice( purchase ) +
				( domain.isRedeemable && redemptionProduct ? redemptionProduct.cost : 0 );
			const currencyCode = purchase.currencyCode;
			formattedPrice = formatCurrency( renewalPrice, currencyCode, { stripZeros: true } )!;
		}

		const autoRenewAdditionalText = ! isExpiring( purchase )
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

	const shouldNotRenderRenewButton = () => {
		return (
			! domain.subscriptionId ||
			domain.isPendingRenewal ||
			! domain.currentUserCanManage ||
			domain.expired ||
			isExpiringSoon( domain, 30 ) || // from `registered-domain-type` and `mapped-domain-type`
			( ! isLoadingPurchase && ! purchase ) ||
			domain.aftermarketAuction
		);
	};

	const renderRenewButton = () => {
		if ( shouldNotRenderRenewButton() ) {
			return null;
		}

		return (
			<RenewButton
				purchase={ purchase }
				selectedSite={ selectedSite }
				subscriptionId={ parseInt( domain.subscriptionId!, 10 ) }
				tracksProps={ { source: 'registered-domain-status', domain_status: 'active' } }
				customLabel={ translate( 'Renew now' ) }
				disabled={ isLoadingPurchase }
			/>
		);
	};

	const renderPaymentDetailsButton = () => {
		if ( ! domain.subscriptionId ) {
			return null;
		}
		return (
			<Button href={ getManagePurchaseUrlFor( selectedSite.slug, domain.subscriptionId ) }>
				{ translate( 'Payment details' ) }
			</Button>
		);
	};

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

export default RegisteredDomainDetails;
