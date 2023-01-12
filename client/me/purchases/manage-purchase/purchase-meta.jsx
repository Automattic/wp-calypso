import config from '@automattic/calypso-config';
import {
	isConciergeSession,
	isDomainRegistration,
	isDomainTransfer,
	isJetpackPlan,
	isJetpackProduct,
	JETPACK_LEGACY_PLANS,
} from '@automattic/calypso-products';
import { Card } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { times } from 'lodash';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import ClipboardButton from 'calypso/components/forms/clipboard-button';
import FormTextInput from 'calypso/components/forms/form-text-input';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import useUserLicenseBySubscriptionQuery from 'calypso/data/jetpack-licensing/use-user-license-by-subscription-query';
import {
	getName,
	hasPaymentMethod,
	isExpired,
	isExpiring,
	isIncludedWithPlan,
	isOneTimePurchase,
	isRechargeable,
	isRenewing,
	isSubscription,
	isCloseToExpiration,
	isRenewable,
} from 'calypso/lib/purchases';
import { CALYPSO_CONTACT, JETPACK_SUPPORT } from 'calypso/lib/url/support';
import { getCurrentUser, getCurrentUserId } from 'calypso/state/current-user/selectors';
import { getByPurchaseId } from 'calypso/state/purchases/selectors';
import { getSite, isRequestingSites } from 'calypso/state/sites/selectors';
import { managePurchase } from '../paths';
import { isJetpackTemporarySitePurchase } from '../utils';
import AutoRenewToggle from './auto-renew-toggle';
import PurchaseMetaIntroductoryOfferDetail from './purchase-meta-introductory-offer-detail';
import PurchaseMetaOwner from './purchase-meta-owner';
import PurchaseMetaPaymentDetails from './purchase-meta-payment-details';
import PurchaseMetaPrice from './purchase-meta-price';

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

	if ( isDataLoading || ! purchaseId || ! purchase ) {
		return <PurchaseMetaPlaceholder />;
	}

	const showJetpackUserLicense = isJetpackProduct( purchase ) || isJetpackPlan( purchase );

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
			{ showJetpackUserLicense && <PurchaseJetpackUserLicense purchaseId={ purchaseId } /> }
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

function RenewErrorMessage( { purchase, translate, site } ) {
	if ( site ) {
		return null;
	}

	const isJetpack = purchase && ( isJetpackPlan( purchase ) || isJetpackProduct( purchase ) );

	if ( isJetpackTemporarySitePurchase( purchase.domain ) ) {
		return null;
	}

	if ( isJetpack ) {
		return (
			<div className="manage-purchase__footnotes">
				{ isExpired( purchase )
					? translate(
							'%(purchaseName)s expired on %(siteSlug)s, and the site is no longer connected to WordPress.com. ' +
								'To renew this purchase, please reconnect %(siteSlug)s to your WordPress.com account, then complete your purchase.',
							{
								args: {
									purchaseName: getName( purchase ),
									siteSlug: purchase.domain,
								},
							}
					  )
					: translate( 'The site %(siteSlug)s is no longer connected to WordPress.com.', {
							args: {
								siteSlug: purchase.domain,
							},
					  } ) }
				&nbsp;
				{ translate(
					'Not sure how to reconnect? {{supportPageLink}}Here are the instructions{{/supportPageLink}}.',
					{
						args: {
							siteSlug: purchase.domain,
						},
						components: {
							supportPageLink: (
								<a
									href={
										localizeUrl( JETPACK_SUPPORT ) +
										'reconnecting-reinstalling-jetpack/#reconnecting-jetpack'
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
	const isJetpackPurchase = isJetpackPlan( purchase ) || isJetpackProduct( purchase );
	const isAutorenewalEnabled = purchase?.isAutoRenewEnabled ?? false;
	const isJetpackPurchaseUsingPrimaryCancellationFlow =
		isJetpackPurchase && config.isEnabled( 'jetpack/cancel-through-main-flow' );
	const hideAutoRenew =
		purchase && JETPACK_LEGACY_PLANS.includes( purchase.productSlug ) && ! isRenewable( purchase );

	if ( ! purchase || isDomainTransfer( purchase ) || purchase?.isInAppPurchase ) {
		return null;
	}

	if ( isRenewable( purchase ) && ! isExpired( purchase ) ) {
		const dateSpan = <span className="manage-purchase__detail-date-span" />;
		// If a jetpack site has been disconnected, the "site" prop will be null here.
		const shouldRenderToggle = site && isProductOwner;
		const autoRenewToggle = shouldRenderToggle ? (
			<AutoRenewToggle
				planName={ site.plan?.product_name_short ?? '' }
				siteDomain={ site.domain }
				siteSlug={ site.slug }
				purchase={ purchase }
				toggleSource="manage-purchase"
				showLink={ true }
				getChangePaymentMethodUrlFor={ getChangePaymentMethodUrlFor }
			/>
		) : (
			<span />
		);
		const subsRenewText = isAutorenewalEnabled
			? translate( 'Auto-renew is {{autoRenewToggle}}ON{{/autoRenewToggle}}', {
					components: {
						autoRenewToggle,
					},
			  } )
			: translate( 'Auto-renew is {{autoRenewToggle}}OFF{{/autoRenewToggle}}', {
					components: {
						autoRenewToggle,
					},
			  } );

		const subsReEnableText = translate(
			'{{autoRenewToggle}}Re-activate subscription{{/autoRenewToggle}}',
			{
				components: {
					autoRenewToggle,
				},
			}
		);

		let subsBillingText;
		if (
			isAutorenewalEnabled &&
			! hideAutoRenew &&
			hasPaymentMethod( purchase ) &&
			isRechargeable( purchase )
		) {
			subsBillingText = translate( 'You will be billed on {{dateSpan}}%(renewDate)s{{/dateSpan}}', {
				args: {
					renewDate: purchase.renewDate && moment( purchase.renewDate ).format( 'LL' ),
				},
				components: {
					dateSpan,
				},
			} );
		} else {
			subsBillingText = translate( 'Expires on {{dateSpan}}%(expireDate)s{{/dateSpan}}', {
				args: {
					expireDate: moment( purchase.expiryDate ).format( 'LL' ),
				},
				components: {
					dateSpan,
				},
			} );
		}

		return (
			<li className="manage-purchase__meta-expiration">
				<em className="manage-purchase__detail-label">{ translate( 'Subscription Renewal' ) }</em>
				{ ! hideAutoRenew && ! isJetpackPurchaseUsingPrimaryCancellationFlow && (
					<div className="manage-purchase__auto-renew">
						<span className="manage-purchase__detail manage-purchase__auto-renew-text">
							{ subsRenewText }
						</span>
					</div>
				) }
				<span
					className={ classNames( 'manage-purchase__detail', {
						'is-expiring': isCloseToExpiration( purchase ),
					} ) }
				>
					{ subsBillingText }
				</span>
				{ ! isAutorenewalEnabled &&
					! hideAutoRenew &&
					shouldRenderToggle &&
					isJetpackPurchaseUsingPrimaryCancellationFlow && (
						<div className="manage-purchase__auto-renew">
							<span className="manage-purchase__detail manage-purchase__auto-renew-text">
								{ subsReEnableText }
							</span>
						</div>
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

function PurchaseJetpackUserLicense( { purchaseId } ) {
	const translate = useTranslate();
	const { data, isError, isLoading } = useUserLicenseBySubscriptionQuery( purchaseId );

	const [ isCopied, setCopied ] = useState( false );

	useEffect( () => {
		if ( isCopied ) {
			const confirmationTimeout = setTimeout( () => setCopied( false ), 4000 );
			return () => clearTimeout( confirmationTimeout );
		}
	}, [ isCopied ] );

	const showConfirmation = () => {
		setCopied( true );
	};

	if ( isError || isLoading ) {
		return null;
	}

	const { licenseKey } = data;
	// Make sure the size of the input element can hold the entire key
	const licenseKeyInputSize = licenseKey.length + 5;

	return (
		<Card className="manage-purchase__jetpack-user-license">
			<strong>{ translate( 'License key' ) }</strong>
			<div className="manage-purchase__jetpack-user-license-clipboard">
				<FormTextInput
					className="manage-purchase__jetpack-user-license-input"
					value={ licenseKey }
					size={ licenseKeyInputSize }
					readOnly
				/>
				<ClipboardButton text={ licenseKey } onCopy={ showConfirmation } compact>
					{ isCopied ? translate( 'Copied!' ) : translate( 'Copy', { context: 'verb' } ) }
				</ClipboardButton>
			</div>
		</Card>
	);
}
