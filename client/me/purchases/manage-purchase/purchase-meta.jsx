import {
	isConciergeSession,
	isDomainRegistration,
	isJetpackPlan,
	isJetpackProduct,
} from '@automattic/calypso-products';
import { Card } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import i18n, { getLocaleSlug, useTranslate } from 'i18n-calypso';
import { times } from 'lodash';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import QueryAkismetKey from 'calypso/components/data/query-akismet-key';
import ClipboardButton from 'calypso/components/forms/clipboard-button';
import FormTextInput from 'calypso/components/forms/form-text-input';
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
import { CALYPSO_CONTACT, JETPACK_SUPPORT } from 'calypso/lib/url/support';
import getAkismetKey from 'calypso/state/akismet-key/selectors/get-akismet-key';
import isFetchingAkismetKey from 'calypso/state/akismet-key/selectors/is-fetching-akismet-key';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { getByPurchaseId } from 'calypso/state/purchases/selectors';
import { getSite, isRequestingSites } from 'calypso/state/sites/selectors';
import { managePurchase } from '../paths';
import { isAkismetTemporarySitePurchase, isTemporarySitePurchase } from '../utils';
import PurchaseMetaExpiration from './purchase-meta-expiration';
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
	const showAkismetApiKey = isAkismetTemporarySitePurchase( purchase );

	const renewalPriceHeader =
		getLocaleSlug().startsWith( 'en' ) || i18n.hasTranslation( 'Renewal Price' )
			? translate( 'Renewal Price' )
			: translate( 'Price' );

	return (
		<>
			<ul className="manage-purchase__meta">
				<PurchaseMetaOwner owner={ owner } />
				<li>
					<em className="manage-purchase__detail-label">{ renewalPriceHeader }</em>
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
					renderRenewsOrExpiresOn={ renderRenewsOrExpiresOn }
					renderRenewsOrExpiresOnLabel={ renderRenewsOrExpiresOnLabel }
				/>
				<PurchaseMetaPaymentDetails
					purchase={ purchase }
					getChangePaymentMethodUrlFor={ getChangePaymentMethodUrlFor }
					siteSlug={ siteSlug }
					site={ site }
				/>
			</ul>
			{ showJetpackUserLicense && <PurchaseJetpackUserLicense purchaseId={ purchaseId } /> }
			{ showAkismetApiKey && <PurchaseAkismetApiKey purchaseId={ purchaseId } /> }
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

function PurchaseJetpackUserLicense( { purchaseId } ) {
	const translate = useTranslate();
	const { data, isError, isLoading } = useUserLicenseBySubscriptionQuery( purchaseId );

	if ( isError ) {
		return null;
	}

	const { licenseKey } = data ? data : '';
	// Make sure the size of the input element can hold the entire key
	const licenseKeyInputSize = licenseKey ? licenseKey.length + 5 : 0;

	return (
		<PurchaseClipboardCard
			label={ translate( 'License Key' ) }
			size={ licenseKeyInputSize }
			value={ licenseKey }
			loading={ isLoading }
		/>
	);
}

function PurchaseAkismetApiKey() {
	const translate = useTranslate();
	const isLoadingKey = useSelector( ( state ) => {
		return isFetchingAkismetKey( state );
	} );
	const akismetApiKey = useSelector( ( state ) => {
		return getAkismetKey( state );
	} );
	const keyInputSize = akismetApiKey ? akismetApiKey.length + 5 : 0;

	return (
		<>
			<QueryAkismetKey />
			<PurchaseClipboardCard
				label={ translate( 'Akismet API Key' ) }
				size={ keyInputSize }
				value={ akismetApiKey }
				loading={ isLoadingKey }
			/>
		</>
	);
}

function PurchaseClipboardCard( { label, value, size, loading = false } ) {
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
		</Card>
	);
}
