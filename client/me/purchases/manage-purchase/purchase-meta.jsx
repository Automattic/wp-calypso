/**
 * External dependencies
 */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslate } from 'i18n-calypso';
import { times } from 'lodash';

/**
 * Internal Dependencies
 */
import {
	getName,
	isExpired,
	isExpiring,
	isIncludedWithPlan,
	isOneTimePurchase,
	isPaidWithCreditCard,
	cardProcessorSupportsUpdates,
	isRenewing,
	isSubscription,
	isCloseToExpiration,
	isRenewable,
	isWithinIntroductoryOfferPeriod,
	isIntroductoryOfferFreeTrial,
} from 'calypso/lib/purchases';
import { getByPurchaseId } from 'calypso/state/purchases/selectors';
import { getSite, isRequestingSites } from 'calypso/state/sites/selectors';
import { managePurchase } from '../paths';
import AutoRenewToggle from './auto-renew-toggle';
import { CALYPSO_CONTACT, JETPACK_SUPPORT } from 'calypso/lib/url/support';
import UserItem from 'calypso/components/user';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { canEditPaymentDetails } from '../utils';
import {
	getPlan,
	TERM_BIENNIALLY,
	TERM_MONTHLY,
	JETPACK_LEGACY_PLANS,
	isDomainRegistration,
	isDomainTransfer,
	isConciergeSession,
	isJetpackPlan,
	isJetpackProduct,
	getProductFromSlug,
} from '@automattic/calypso-products';
import { getCurrentUser, getCurrentUserId } from 'calypso/state/current-user/selectors';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { TITAN_MAIL_MONTHLY_SLUG } from 'calypso/lib/titan/constants';
import PaymentInfoBlock from './payment-info-block';
import { getIntroductoryOfferIntervalDisplay } from 'calypso/lib/purchases/utils';

export default function PurchaseMeta( {
	purchaseId = false,
	hasLoadedPurchasesFromServer = false,
	siteSlug,
	getChangePaymentMethodUrlFor,
	getManagePurchaseUrlFor = managePurchase,
} ) {
	const translate = useTranslate();

	const purchase = useSelector( ( state ) => getByPurchaseId( state, purchaseId ) );
	const site = useSelector( ( state ) => getSite( state, purchase?.siteId ) ) || null;

	// TODO: if the owner is not the currently logged-in user, retrieve their info from users list
	const currentUser = useSelector( getCurrentUser );
	const owner = currentUser && purchase?.userId === currentUser.ID ? currentUser : null;

	const isDataLoading = useSelector( isRequestingSites ) || ! hasLoadedPurchasesFromServer;

	if ( isDataLoading || ! purchaseId ) {
		return <PurchaseMetaPlaceholder />;
	}

	return (
		<>
			<ul className="manage-purchase__meta">
				<PurchaseMetaOwner owner={ owner } />
				<li>
					<em className="manage-purchase__detail-label">{ translate( 'Price' ) }</em>
					<span className="manage-purchase__detail">
						<PurchaseMetaPrice purchase={ purchase } />
						<PurchaseMetaIntroductoryOfferDetail purchase={ purchase } />
					</span>
				</li>
				<PurchaseMetaExpiration
					purchase={ purchase }
					site={ site }
					siteSlug={ siteSlug }
					getChangePaymentMethodUrlFor={ getChangePaymentMethodUrlFor }
					getManagePurchaseUrlFor={ getManagePurchaseUrlFor }
				/>
				<PurchaseMetaPaymentDetails
					purchase={ purchase }
					getChangePaymentMethodUrlFor={ getChangePaymentMethodUrlFor }
					siteSlug={ siteSlug }
					site={ site }
				/>
			</ul>
			<RenewErrorMessage purchase={ purchase } translate={ translate } site={ site } />
		</>
	);
}

PurchaseMeta.propTypes = {
	hasLoadedPurchasesFromServer: PropTypes.bool.isRequired,
	purchaseId: PropTypes.oneOfType( [ PropTypes.number, PropTypes.bool ] ).isRequired,
	siteSlug: PropTypes.string.isRequired,
	getManagePurchaseUrlFor: PropTypes.func,
	getChangePaymentMethodUrlFor: PropTypes.func,
};

function renderRenewsOrExpiresOnLabel( { purchase, translate } ) {
	if ( isExpiring( purchase ) ) {
		if ( isDomainRegistration( purchase ) ) {
			return translate( 'Domain expires on' );
		}

		if ( isSubscription( purchase ) ) {
			return translate( 'Subscription expires on' );
		}

		if ( isOneTimePurchase( purchase ) ) {
			return translate( 'Expires on' );
		}
	}

	if ( isExpired( purchase ) ) {
		if ( isDomainRegistration( purchase ) ) {
			return translate( 'Domain expired on' );
		}

		if ( isConciergeSession( purchase ) ) {
			return translate( 'Session used on' );
		}

		if ( isSubscription( purchase ) ) {
			return translate( 'Subscription expired on' );
		}

		if ( isOneTimePurchase( purchase ) ) {
			return translate( 'Expired on' );
		}
	}

	if ( isDomainRegistration( purchase ) ) {
		return translate( 'Domain renews on' );
	}

	if ( isSubscription( purchase ) ) {
		return translate( 'Subscription renews on' );
	}

	if ( isOneTimePurchase( purchase ) ) {
		return translate( 'Renews on' );
	}

	return null;
}

function renderRenewsOrExpiresOn( {
	moment,
	purchase,
	siteSlug,
	translate,
	getManagePurchaseUrlFor,
} ) {
	if ( isIncludedWithPlan( purchase ) ) {
		const attachedPlanUrl = getManagePurchaseUrlFor( siteSlug, purchase.attachedToPurchaseId );

		return (
			<span>
				<a href={ attachedPlanUrl }>{ translate( 'Renews with Plan' ) }</a>
			</span>
		);
	}

	if ( isExpiring( purchase ) || isExpired( purchase ) ) {
		return moment( purchase.expiryDate ).format( 'LL' );
	}

	if ( isRenewing( purchase ) ) {
		return moment( purchase.renewDate ).format( 'LL' );
	}

	if ( isOneTimePurchase( purchase ) ) {
		return translate( 'Never Expires' );
	}
}

function PurchaseMetaPlaceholder() {
	return (
		<ul className="manage-purchase__meta">
			{ times( 4, ( i ) => (
				<li key={ i }>
					<em className="manage-purchase__detail-label" />
					<span className="manage-purchase__detail" />
				</li>
			) ) }
		</ul>
	);
}

function PurchaseMetaOwner( { owner } ) {
	const translate = useTranslate();
	if ( ! owner ) {
		return null;
	}

	return (
		<li>
			<em className="manage-purchase__detail-label">{ translate( 'Owner' ) }</em>
			<span className="manage-purchase__detail">
				<UserItem user={ { ...owner, name: owner.display_name } } />
			</span>
		</li>
	);
}

function PurchaseMetaPrice( { purchase } ) {
	const translate = useTranslate();
	const { priceText, productSlug } = purchase;
	const plan = getPlan( productSlug ) || getProductFromSlug( productSlug );
	let period = translate( 'year' );

	if ( isOneTimePurchase( purchase ) || isDomainTransfer( purchase ) ) {
		// translators: %(priceText)s is the price of the purchase with localized currency (i.e. "C$10")
		return translate( '%(priceText)s {{period}}(one-time){{/period}}', {
			args: { priceText },
			components: {
				period: <span className="manage-purchase__time-period" />,
			},
		} );
	}

	if ( isIncludedWithPlan( purchase ) ) {
		return translate( 'Free with Plan' );
	}

	if ( plan && plan.term ) {
		switch ( plan.term ) {
			case TERM_BIENNIALLY:
				period = translate( 'two years' );
				break;

			case TERM_MONTHLY:
				period = translate( 'month' );
				break;
		}
	}

	if ( productSlug === TITAN_MAIL_MONTHLY_SLUG ) {
		period = translate( 'month' );
	}

	// translators: %(priceText)s is the price of the purchase with localized currency (i.e. "C$10"), %(period)s is how long the plan is active (i.e. "year")
	return translate( '%(priceText)s {{period}}/ %(period)s{{/period}}', {
		args: { priceText, period },
		components: {
			period: <span className="manage-purchase__time-period" />,
		},
	} );
}

function PurchaseMetaIntroductoryOfferDetail( { purchase } ) {
	const translate = useTranslate();

	if ( ! isWithinIntroductoryOfferPeriod( purchase ) ) {
		return null;
	}

	const text = getIntroductoryOfferIntervalDisplay(
		translate,
		purchase.introductoryOffer.intervalUnit,
		purchase.introductoryOffer.intervalCount,
		isIntroductoryOfferFreeTrial( purchase )
	);

	return (
		<>
			<br />
			<small> { text } </small>
		</>
	);
}

function PurchaseMetaPaymentDetails( { purchase, getChangePaymentMethodUrlFor, siteSlug, site } ) {
	const handleEditPaymentMethodClick = () => {
		recordTracksEvent( 'calypso_purchases_edit_payment_method' );
	};

	if ( isOneTimePurchase( purchase ) || isDomainTransfer( purchase ) ) {
		return null;
	}

	const paymentDetails = <PaymentInfoBlock purchase={ purchase } />;

	if (
		! canEditPaymentDetails( purchase ) ||
		! isPaidWithCreditCard( purchase ) ||
		! cardProcessorSupportsUpdates( purchase ) ||
		! site
	) {
		return <li>{ paymentDetails }</li>;
	}

	return (
		<li>
			<a
				href={ getChangePaymentMethodUrlFor( siteSlug, purchase ) }
				onClick={ handleEditPaymentMethodClick }
			>
				{ paymentDetails }
			</a>
		</li>
	);
}

function RenewErrorMessage( { purchase, translate, site } ) {
	if ( site ) {
		return null;
	}

	const isJetpack = purchase && ( isJetpackPlan( purchase ) || isJetpackProduct( purchase ) );

	if ( isJetpack ) {
		return (
			<div className="manage-purchase__footnotes">
				{ translate(
					'%(purchaseName)s expired on %(siteSlug)s, and the site is no longer connected to WordPress.com. ' +
						'To renew this purchase, please reconnect %(siteSlug)s to your WordPress.com account, then complete your purchase. ' +
						'Now sure how to reconnect? {{supportPageLink}}Here are the instructions{{/supportPageLink}}.',
					{
						args: {
							purchaseName: getName( purchase ),
							siteSlug: purchase.domain,
						},
						components: {
							supportPageLink: (
								<a
									href={
										JETPACK_SUPPORT + 'reconnecting-reinstalling-jetpack/#reconnecting-jetpack'
									}
								/>
							),
						},
					}
				) }
			</div>
		);
	}

	return (
		<div className="manage-purchase__footnotes">
			{ translate(
				'You are the owner of %(purchaseName)s but because you are no longer a user on %(siteSlug)s, ' +
					'renewing it will require staff assistance. Please {{contactSupportLink}}contact support{{/contactSupportLink}}, ' +
					'and consider transferring this purchase to another active user on %(siteSlug)s to avoid this issue in the future.',
				{
					args: {
						purchaseName: getName( purchase ),
						siteSlug: purchase.domain,
					},
					components: {
						contactSupportLink: <a href={ CALYPSO_CONTACT } />,
					},
				}
			) }
		</div>
	);
}

function PurchaseMetaExpiration( {
	purchase,
	site,
	siteSlug,
	getChangePaymentMethodUrlFor,
	getManagePurchaseUrlFor,
} ) {
	const translate = useTranslate();
	const moment = useLocalizedMoment();
	const isProductOwner = purchase?.userId === useSelector( getCurrentUserId );
	const isAutorenewalEnabled = purchase ? ! isExpiring( purchase ) : null;
	const hideAutoRenew =
		purchase && JETPACK_LEGACY_PLANS.includes( purchase.productSlug ) && ! isRenewable( purchase );

	if ( isDomainTransfer( purchase ) ) {
		return null;
	}

	if ( isRenewable( purchase ) && ! isExpired( purchase ) ) {
		const dateSpan = <span className="manage-purchase__detail-date-span" />;
		const subsRenewText = isAutorenewalEnabled
			? translate( 'Auto-renew is ON' )
			: translate( 'Auto-renew is OFF' );
		const subsBillingText =
			isAutorenewalEnabled && ! hideAutoRenew
				? translate( 'You will be billed on {{dateSpan}}%(renewDate)s{{/dateSpan}}', {
						args: {
							renewDate: purchase.renewDate && moment( purchase.renewDate ).format( 'LL' ),
						},
						components: {
							dateSpan,
						},
				  } )
				: translate( 'Expires on {{dateSpan}}%(expireDate)s{{/dateSpan}}', {
						args: {
							expireDate: moment( purchase.expiryDate ).format( 'LL' ),
						},
						components: {
							dateSpan,
						},
				  } );
		return (
			<li>
				<em className="manage-purchase__detail-label">{ translate( 'Subscription Renewal' ) }</em>
				{ ! hideAutoRenew && <span className="manage-purchase__detail">{ subsRenewText }</span> }
				<span
					className={ classNames( 'manage-purchase__detail', {
						'is-expiring': isCloseToExpiration( purchase ),
					} ) }
				>
					{ subsBillingText }
				</span>
				{ site && ! hideAutoRenew && isProductOwner && (
					<span className="manage-purchase__detail">
						<AutoRenewToggle
							planName={ site.plan.product_name_short }
							siteDomain={ site.domain }
							siteSlug={ site.slug }
							purchase={ purchase }
							toggleSource="manage-purchase"
							getChangePaymentMethodUrlFor={ getChangePaymentMethodUrlFor }
						/>
					</span>
				) }
			</li>
		);
	}

	return (
		<li>
			<em className="manage-purchase__detail-label">
				{ renderRenewsOrExpiresOnLabel( { purchase, translate } ) }
			</em>
			<span className="manage-purchase__detail">
				{ renderRenewsOrExpiresOn( {
					moment,
					purchase,
					siteSlug,
					translate,
					getManagePurchaseUrlFor,
				} ) }
			</span>
		</li>
	);
}
