import {
	isConciergeSession,
	isDomainRegistration,
	isJetpackPlan,
	isJetpackProduct,
} from '@automattic/calypso-products';
import { Card } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import { times } from 'lodash';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
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
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { getByPurchaseId } from 'calypso/state/purchases/selectors';
import { getSite, isRequestingSites } from 'calypso/state/sites/selectors';
import { managePurchase } from '../paths';
import { isJetpackTemporarySitePurchase } from '../utils';
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
