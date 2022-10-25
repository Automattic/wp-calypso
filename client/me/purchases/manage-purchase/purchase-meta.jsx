import { isEnabled } from '@automattic/calypso-config';
import {
	getPlan,
	getProductFromSlug,
	isConciergeSession,
	isDIFMProduct,
	isDomainRegistration,
	isDomainTransfer,
	isEmailMonthly,
	isJetpackPlan,
	isJetpackProduct,
	JETPACK_LEGACY_PLANS,
	TERM_BIENNIALLY,
	TERM_MONTHLY,
} from '@automattic/calypso-products';
import { Card } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { getIntroductoryOfferIntervalDisplay } from '@automattic/wpcom-checkout';
import { ToggleControl } from '@wordpress/components';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { times } from 'lodash';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import ClipboardButton from 'calypso/components/forms/clipboard-button';
import FormTextInput from 'calypso/components/forms/form-text-input';
import InfoPopover from 'calypso/components/info-popover';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import UserItem from 'calypso/components/user';
import useUserLicenseBySubscriptionQuery from 'calypso/data/jetpack-licensing/use-user-license-by-subscription-query';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import {
	getName,
	hasPaymentMethod,
	isExpired,
	isExpiring,
	isIncludedWithPlan,
	isOneTimePurchase,
	isPaidWithCreditCard,
	isRechargeable,
	isRenewing,
	isSubscription,
	isCloseToExpiration,
	isRenewable,
	isWithinIntroductoryOfferPeriod,
	isIntroductoryOfferFreeTrial,
	getDIFMTieredPurchaseDetails,
} from 'calypso/lib/purchases';
import { CALYPSO_CONTACT, JETPACK_SUPPORT } from 'calypso/lib/url/support';
import { getCurrentUser, getCurrentUserId } from 'calypso/state/current-user/selectors';
import { getByPurchaseId } from 'calypso/state/purchases/selectors';
import { getSite, isRequestingSites } from 'calypso/state/sites/selectors';
import { getAllStoredCards } from 'calypso/state/stored-cards/selectors';
import { managePurchase } from '../paths';
import { canEditPaymentDetails, isJetpackTemporarySitePurchase } from '../utils';
import AutoRenewToggle from './auto-renew-toggle';
import PaymentInfoBlock from './payment-info-block';

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
	const { productSlug, productDisplayPrice } = purchase;
	const plan = getPlan( productSlug ) || getProductFromSlug( productSlug );
	let period = translate( 'year' );

	if ( isOneTimePurchase( purchase ) || isDomainTransfer( purchase ) ) {
		if ( isDIFMProduct( purchase ) ) {
			const difmTieredPurchaseDetails = getDIFMTieredPurchaseDetails( purchase );
			if ( difmTieredPurchaseDetails && difmTieredPurchaseDetails.extraPageCount > 0 ) {
				const {
					extraPageCount,
					formattedCostOfExtraPages: costOfExtraPages,
					formattedOneTimeFee: oneTimeFee,
				} = difmTieredPurchaseDetails;
				return (
					<div>
						<div>
							{ translate( 'Service: %(oneTimeFee)s (one-time)', {
								args: {
									oneTimeFee,
								},
							} ) }
						</div>
						<div>
							{ translate(
								'%(extraPageCount)d extra page: %(costOfExtraPages)s (one-time)',
								'%(extraPageCount)d extra pages: %(costOfExtraPages)s (one-time)',
								{
									count: extraPageCount,
									args: {
										extraPageCount,
										costOfExtraPages,
									},
								}
							) }
						</div>
					</div>
				);
			}
		}

		// translators: displayPrice is the price of the purchase with localized currency (i.e. "C$10")
		return translate( '{{displayPrice/}} {{period}}(one-time){{/period}}', {
			components: {
				displayPrice: (
					<span
						// eslint-disable-next-line react/no-danger
						dangerouslySetInnerHTML={ { __html: productDisplayPrice } }
					/>
				),
				period: <span className="manage-purchase__time-period" />,
			},
		} );
	}

	if ( isIncludedWithPlan( purchase ) ) {
		return translate( 'Free with Plan' );
	}

	if ( purchase.billPeriodLabel ) {
		switch ( purchase.billPeriodLabel ) {
			case 'per year':
				period = translate( 'year' );
				break;
			case 'per month':
				period = translate( 'month' );
				break;
			case 'per week':
				period = translate( 'week' );
				break;
			case 'per day':
				period = translate( 'day' );
				break;
		}
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

	if ( isEmailMonthly( purchase ) ) {
		period = translate( 'month' );
	}

	// translators: displayPrice is the price of the purchase with localized currency (i.e. "C$10"), %(period)s is how long the plan is active (i.e. "year")
	return translate( '{{displayPrice/}} {{period}}/ %(period)s{{/period}}', {
		args: { period },
		components: {
			displayPrice: (
				<span
					// eslint-disable-next-line react/no-danger
					dangerouslySetInnerHTML={ { __html: productDisplayPrice } }
				/>
			),
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
		isIntroductoryOfferFreeTrial( purchase ),
		'manage-purchases',
		purchase.introductoryOffer.remainingRenewalsUsingOffer
	);

	let regularPriceText = null;
	if ( purchase.introductoryOffer.isNextRenewalUsingOffer ) {
		regularPriceText = translate(
			'After the offer ends, the subscription price will be %(regularPrice)s',
			{
				args: {
					regularPrice: purchase.regularPriceText,
				},
			}
		);
	} else if ( purchase.introductoryOffer.isNextRenewalProrated ) {
		regularPriceText = translate(
			'After the first renewal, the subscription price will be %(regularPrice)s',
			{
				args: {
					regularPrice: purchase.regularPriceText,
				},
			}
		);
	}

	return (
		<>
			<br />
			<small> { text } </small>
			{ regularPriceText && (
				<>
					{ ' ' }
					<br /> <small> { regularPriceText } </small>{ ' ' }
				</>
			) }
		</>
	);
}

function PurchaseMetaPaymentDetails( { purchase, getChangePaymentMethodUrlFor, siteSlug, site } ) {
	const cards = useSelector( getAllStoredCards );
	const handleEditPaymentMethodClick = () => {
		recordTracksEvent( 'calypso_purchases_edit_payment_method' );
	};

	if ( isOneTimePurchase( purchase ) || isDomainTransfer( purchase ) ) {
		return null;
	}

	const paymentDetails = <PaymentInfoBlock purchase={ purchase } cards={ cards } />;

	if ( ! canEditPaymentDetails( purchase ) || ! isPaidWithCreditCard( purchase ) || ! site ) {
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
	const isAutorenewalEnabled = purchase?.isAutoRenewEnabled ?? false;
	const hideAutoRenew =
		purchase && JETPACK_LEGACY_PLANS.includes( purchase.productSlug ) && ! isRenewable( purchase );

	const [ isGiftingEnabled, setGifting ] = useState( true );
	useEffect( () => {
		if ( isGiftingEnabled ) {
			setGifting( isGiftingEnabled );
		}
	}, [ isGiftingEnabled ] );

	if ( ! purchase || isDomainTransfer( purchase ) || purchase?.isInAppPurchase ) {
		return null;
	}

	if ( isRenewable( purchase ) && ! isExpired( purchase ) ) {
		const dateSpan = <span className="manage-purchase__detail-date-span" />;
		const shouldRenderToggle = site && isProductOwner;
		const autoRenewToggle = shouldRenderToggle ? (
			<AutoRenewToggle
				planName={ site.plan.product_name_short }
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

		const toggleLabel = (
			<>
				{ translate( 'Allow users to cover your subscription' ) }
				<InfoPopover
					screenReaderText={ translate( 'Learn more' ) }
					icon="help-outline"
					iconSize={ 14 }
				>
					{ translate(
						'Proin nunc magna, ullamcorper id dapibus vel, suscipit eu mauris. Vivamus faucibus ligula et euismod vehicula. Curabitur suscipit diam nec luctus facilisis. Vestibulum dolor ante, suscipit vel euismod at, ornare ultrices nunc.'
					) }
				</InfoPopover>
			</>
		);

		return (
			<li className="manage-purchase__meta-expiration">
				<em className="manage-purchase__detail-label">{ translate( 'Subscription Renewal' ) }</em>
				{ ! hideAutoRenew && (
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
				{ ! isAutorenewalEnabled && isEnabled( 'subscription-gifting' ) && (
					<>
						<ToggleControl
							className="manage-purchase__gifting-toggle"
							label={ toggleLabel }
							checked={ isGiftingEnabled }
							onChange={ setGifting }
						/>
					</>
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
