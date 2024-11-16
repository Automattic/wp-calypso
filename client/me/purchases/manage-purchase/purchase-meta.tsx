import {
	isConciergeSession,
	isDomainRegistration,
	isJetpackPlan,
	isJetpackProduct,
} from '@automattic/calypso-products';
import { Card } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { CALYPSO_CONTACT, JETPACK_SUPPORT } from '@automattic/urls';
import { ExternalLink } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState, useEffect } from 'react';
import ClipboardButton from 'calypso/components/forms/clipboard-button';
import FormTextInput from 'calypso/components/forms/form-text-input';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import useAkismetKeyQuery from 'calypso/data/akismet/use-akismet-key-query';
import useUserLicenseBySubscriptionQuery from 'calypso/data/jetpack-licensing/use-user-license-by-subscription-query';
import {
	getName,
	isExpired,
	isExpiring,
	isIncludedWithPlan,
	isOneTimePurchase,
	isRenewing,
	isSubscription,
} from 'calypso/lib/purchases';
import { useSelector } from 'calypso/state';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { getByPurchaseId } from 'calypso/state/purchases/selectors';
import { getSite, isRequestingSites } from 'calypso/state/sites/selectors';
import { managePurchase } from '../paths';
import { isAkismetTemporarySitePurchase, isTemporarySitePurchase } from '../utils';
import PurchaseMetaAutoRenewCouponDetail from './purchase-meta-auto-renew-coupon-detail';
import PurchaseMetaExpiration from './purchase-meta-expiration';
import PurchaseMetaIntroductoryOfferDetail from './purchase-meta-introductory-offer-detail';
import PurchaseMetaOwner from './purchase-meta-owner';
import PurchaseMetaPaymentDetails from './purchase-meta-payment-details';
import PurchaseMetaPrice from './purchase-meta-price';
import type { SiteDetails } from '@automattic/data-stores';
import type {
	GetChangePaymentMethodUrlFor,
	GetManagePurchaseUrlFor,
	Purchase,
} from 'calypso/lib/purchases/types';

export interface PurchaseMetaProps {
	purchaseId: number | false;
	hasLoadedPurchasesFromServer: boolean;
	siteSlug: string;
	getChangePaymentMethodUrlFor: GetChangePaymentMethodUrlFor;
	getManagePurchaseUrlFor?: GetManagePurchaseUrlFor;
}

export default function PurchaseMeta( {
	purchaseId = false,
	hasLoadedPurchasesFromServer = false,
	siteSlug,
	getChangePaymentMethodUrlFor,
	getManagePurchaseUrlFor = managePurchase,
}: PurchaseMetaProps ) {
	const translate = useTranslate();

	const purchase = useSelector( ( state ) =>
		purchaseId ? getByPurchaseId( state, purchaseId ) : undefined
	);
	const site = useSelector( ( state ) => getSite( state, purchase?.siteId ) ) || null;

	// TODO: if the owner is not the currently logged-in user, retrieve their info from users list
	const currentUser = useSelector( getCurrentUser );
	const owner = currentUser && purchase?.userId === currentUser.ID ? currentUser : null;

	const isDataLoading = useSelector( isRequestingSites ) || ! hasLoadedPurchasesFromServer;

	if ( isDataLoading || ! purchaseId || ! purchase ) {
		return <PurchaseMetaPlaceholder />;
	}

	const showJetpackUserLicense = isJetpackProduct( purchase ) || isJetpackPlan( purchase );
	const isAkismetPurchase = isAkismetTemporarySitePurchase( purchase );

	const renewalPriceHeader = translate( 'Renewal Price' );

	const hideRenewalPriceSection = isOneTimePurchase( purchase );
	const hideTaxString = isIncludedWithPlan( purchase );

	// To-do: There isn't currently a way to get the taxName based on the country.
	// The country is not included in the purchase information envelope
	// We should add this information so we can utilize useTaxName to retrieve the correct taxName
	// For now, we are using a fallback tax name
	const taxName = translate( 'tax', {
		context: "Shortened form of 'Sales Tax', not a country-specific tax name",
	} );

	/* translators: %s is the name of taxes in the country (eg: "VAT" or "GST"). */
	const excludeTaxStringAbbreviation = translate( 'excludes %s', {
		textOnly: true,
		args: [ taxName ],
	} );

	/* translators: %s is the name of taxes in the country (eg: "VAT" or "GST"). */
	const excludeTaxStringTitle = translate( 'Renewal price excludes any applicable %s', {
		textOnly: true,
		args: [ taxName ],
	} );

	return (
		<>
			<ul className="manage-purchase__meta">
				<PurchaseMetaOwner owner={ owner } />
				{ ! hideRenewalPriceSection && (
					<li>
						<em className="manage-purchase__detail-label">{ renewalPriceHeader }</em>
						<span className="manage-purchase__detail">
							<PurchaseMetaPrice purchase={ purchase } />
						</span>
						{ ! hideTaxString && (
							<span>
								<abbr title={ excludeTaxStringTitle }>{ excludeTaxStringAbbreviation }</abbr>
							</span>
						) }
						<PurchaseMetaAutoRenewCouponDetail purchase={ purchase } />
						<PurchaseMetaIntroductoryOfferDetail purchase={ purchase } />
					</li>
				) }
				<PurchaseMetaExpiration
					purchase={ purchase }
					site={ site ?? undefined }
					siteSlug={ siteSlug }
					getChangePaymentMethodUrlFor={ getChangePaymentMethodUrlFor }
					getManagePurchaseUrlFor={ getManagePurchaseUrlFor }
					renderRenewsOrExpiresOn={ renderRenewsOrExpiresOn }
					renderRenewsOrExpiresOnLabel={ renderRenewsOrExpiresOnLabel }
				/>
				<PurchaseMetaPaymentDetails
					purchase={ purchase }
					getChangePaymentMethodUrlFor={ getChangePaymentMethodUrlFor }
					siteSlug={ siteSlug }
					site={ site ?? undefined }
					isAkismetPurchase={ isAkismetPurchase }
				/>
			</ul>
			{ showJetpackUserLicense && <PurchaseJetpackUserLicense purchaseId={ purchaseId } /> }
			{ isAkismetPurchase && <PurchaseAkismetApiKey /> }
			<RenewErrorMessage purchase={ purchase } translate={ translate } site={ site } />
		</>
	);
}

function renderRenewsOrExpiresOnLabel( {
	purchase,
	translate,
}: {
	purchase: Purchase;
	translate: ReturnType< typeof useTranslate >;
} ): string | null {
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
}: {
	moment: ReturnType< typeof useLocalizedMoment >;
	purchase: Purchase;
	siteSlug: string | undefined;
	translate: ReturnType< typeof useTranslate >;
	getManagePurchaseUrlFor: GetManagePurchaseUrlFor;
} ): JSX.Element | null {
	if ( isIncludedWithPlan( purchase ) && siteSlug ) {
		const attachedPlanUrl = getManagePurchaseUrlFor( siteSlug, purchase.attachedToPurchaseId );

		return (
			<span>
				<a href={ attachedPlanUrl }>{ translate( 'Renews with Plan' ) }</a>
			</span>
		);
	}

	if ( isExpiring( purchase ) || isExpired( purchase ) ) {
		return <>{ moment( purchase.expiryDate ).format( 'LL' ) }</>;
	}

	if ( isRenewing( purchase ) ) {
		return <>{ moment( purchase.renewDate ).format( 'LL' ) }</>;
	}

	if ( isOneTimePurchase( purchase ) ) {
		return <>{ translate( 'Never Expires' ) }</>;
	}
	return null;
}

function PurchaseMetaPlaceholder() {
	return (
		<ul className="manage-purchase__meta">
			{ Array.from( { length: 4 } ).map( ( _, i ) => (
				<li key={ i }>
					<em className="manage-purchase__detail-label" />
					<span className="manage-purchase__detail" />
				</li>
			) ) }
		</ul>
	);
}

function RenewErrorMessage( {
	purchase,
	translate,
	site,
}: {
	purchase: Purchase;
	translate: ReturnType< typeof useTranslate >;
	site?: SiteDetails | null;
} ) {
	if ( site ) {
		return null;
	}

	const isJetpack = purchase && ( isJetpackPlan( purchase ) || isJetpackProduct( purchase ) );

	if ( isTemporarySitePurchase( purchase ) ) {
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

function PurchaseJetpackUserLicense( { purchaseId }: { purchaseId: number } ) {
	const translate = useTranslate();
	const { data, isError, isLoading, isInitialLoading } =
		useUserLicenseBySubscriptionQuery( purchaseId );

	if ( isError ) {
		return null;
	}

	const { licenseKey } = data ? data : { licenseKey: '' };
	// Make sure the size of the input element can hold the entire key
	const licenseKeyInputSize = licenseKey ? licenseKey.length + 5 : 0;

	return (
		<PurchaseClipboardCard
			label={ translate( 'License Key' ) }
			size={ licenseKeyInputSize }
			value={ licenseKey }
			loading={ isLoading || isInitialLoading }
			activationUrl="https://jetpack.com/support/activate-a-jetpack-product-via-license-key/"
		/>
	);
}

function PurchaseAkismetApiKey() {
	const translate = useTranslate();
	const { data, isError, isLoading } = useAkismetKeyQuery();

	if ( isError ) {
		return null;
	}

	const akismetApiKey = data ?? '';
	const keyInputSize = akismetApiKey ? akismetApiKey.length + 5 : 0;

	return (
		<>
			<PurchaseClipboardCard
				label={ translate( 'Akismet API Key' ) }
				size={ keyInputSize }
				value={ akismetApiKey }
				loading={ isLoading }
				activationUrl="https://akismet.com/support/getting-started/api-key/"
			/>
		</>
	);
}

function PurchaseClipboardCard( {
	label,
	value,
	size,
	loading = false,
	activationUrl,
}: {
	label: string;
	value: string;
	size: number;
	loading?: boolean;
	activationUrl: string;
} ) {
	const translate = useTranslate();
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

	return (
		<Card className="manage-purchase__license-clipboard-container">
			<strong>{ label }</strong>
			<div className={ 'manage-purchase__license-clipboard' + ( loading ? ' loading' : '' ) }>
				{ ! loading && (
					<>
						<FormTextInput
							className="manage-purchase__license-clipboard-input"
							value={ value }
							size={ size }
							readOnly
						/>
						<ClipboardButton text={ value } onCopy={ showConfirmation } compact>
							{ isCopied ? translate( 'Copied!' ) : translate( 'Copy', { context: 'verb' } ) }
						</ClipboardButton>
					</>
				) }
			</div>
			<ExternalLink className="manage-purchase__license-clipboard-link" href={ activationUrl }>
				{ translate( 'How to activate' ) }
			</ExternalLink>
		</Card>
	);
}
