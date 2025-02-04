/* eslint-disable wpcalypso/jsx-classname-namespace */
import config from '@automattic/calypso-config';
import { Button } from '@automattic/components';
import formatCurrency from '@automattic/format-currency';
import { useTranslate } from 'i18n-calypso';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { getRenewalPrice, isExpiring } from 'calypso/lib/purchases';
import AutoRenewToggle from 'calypso/me/purchases/manage-purchase/auto-renew-toggle';
import { managePurchase } from 'calypso/me/purchases/paths';
import RenewButton from 'calypso/my-sites/domains/domain-management/edit/card/renew-button';
import { getManagePurchaseUrlFor } from 'calypso/my-sites/purchases/paths';
import { useSelector } from 'calypso/state';
import { getProductBySlug } from 'calypso/state/products-list/selectors';
import type { DetailsCardProps } from './types';

import './style.scss';

const RegisteredDomainDetails = ( {
	domain,
	isLoadingPurchase,
	purchase,
	selectedSite,
}: DetailsCardProps ) => {
	const moment = useLocalizedMoment();
	const translate = useTranslate();
	const redemptionProduct = useSelector( ( state ) =>
		getProductBySlug( state, 'domain_redemption' )
	);

	const renderDates = () => {
		// translators: this is followed by a date, e.g. Registered until December 15, 2021
		let untilDateLabel = translate( 'Registered until' );
		if ( domain.expired ) {
			// translators: this is followed by a date, e.g. Expired on December 15, 2021
			untilDateLabel = translate( 'Expired on' );
		} else if ( domain.isHundredYearDomain ) {
			// translators: this is followed by a date, e.g. Paid until December 15, 2021
			untilDateLabel = translate( 'Paid until' );
		}

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
			! domain.currentUserIsOwner ||
			( ! isLoadingPurchase && ! purchase ) ||
			( ! domain.isRenewable && ! domain.isRedeemable ) ||
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
			formattedPrice = formatCurrency( renewalPrice, currencyCode, { stripZeros: true } ) ?? '';
		}

		const autoRenewAdditionalText =
			purchase && ! isExpiring( purchase ) && ! domain.expired
				? translate( 'We will attempt to renew on %(renewalDate)s for %(price)s', {
						args: {
							renewalDate: moment( domain.autoRenewalDate ).format( 'LL' ),
							price: formattedPrice,
						},
				  } )
				: null;

		if ( ! purchase ) {
			return null;
		}

		return (
			<>
				<AutoRenewToggle
					planName={ selectedSite.plan?.product_name_short }
					siteDomain={ selectedSite.domain }
					purchase={ purchase }
					withTextStatus
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
			domain.pendingRegistrationAtRegistry ||
			domain.pendingRegistration ||
			! domain.currentUserCanManage ||
			( ! domain.isRenewable && ! domain.isRedeemable ) ||
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
				subscriptionId={ parseInt( domain.subscriptionId ?? '', 10 ) }
				tracksProps={ { source: 'registered-domain-status', domain_status: 'active' } }
				disabled={ isLoadingPurchase }
			/>
		);
	};

	const renderPaymentDetailsButton = () => {
		if ( ! domain.subscriptionId ) {
			return null;
		}
		const managePurchaseLink = config.isEnabled( 'calypso/all-domain-management' )
			? managePurchase( selectedSite.slug, domain.subscriptionId )
			: getManagePurchaseUrlFor( selectedSite.slug, domain.subscriptionId );

		return <Button href={ managePurchaseLink }>{ translate( 'Payment details' ) }</Button>;
	};

	return (
		<div className="details-card">
			<div className="details-card__section dates">{ renderDates() }</div>
			<div className="details-card__section">{ renderAutoRenewToggle() }</div>
			<div className="details-card__section details-card__section-actions">
				{ renderRenewButton() }
				{ renderPaymentDetailsButton() }
			</div>
		</div>
	);
};

export default RegisteredDomainDetails;
