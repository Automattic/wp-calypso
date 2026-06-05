import {
	getFeatureDifference,
	getFeatureByKey,
	getPlan,
	getPlanPath,
	type PlanSlug,
} from '@automattic/calypso-products';
import { Gridicon } from '@automattic/components';
import { formatCurrency } from '@automattic/number-formatters';
import { Button, Modal, __experimentalHStack as HStack } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import moment from 'moment';
import { useMemo, useState } from 'react';
import { isRefundable } from 'calypso/lib/purchases';
import {
	cancelAndRefundPurchaseAsync,
	enableAutoRenew,
	scheduleDowngradeAsync,
} from 'calypso/lib/purchases/actions';
import { addQueryArgs } from 'calypso/lib/url';
import { useDispatch, useSelector } from 'calypso/state';
import { errorNotice } from 'calypso/state/notices/actions';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import type { Purchase } from 'calypso/lib/purchases/types';

import './style.scss';

interface DowngradeConfirmationModalProps {
	isOpen: boolean;
	currentPlanSlug: PlanSlug;
	targetPlanSlug: PlanSlug | null;
	siteId: number | null | undefined;
	redirectTo?: string;
	onClose: () => void;
	purchase: Purchase | null;
	isPlanExpired: boolean;
	mode?: 'immediate' | 'on_renewal';
	currentRenewalPriceText?: string;
	targetRenewalPriceText?: string;
}

const DowngradeConfirmationModal = ( {
	isOpen,
	currentPlanSlug,
	targetPlanSlug,
	siteId,
	redirectTo,
	onClose,
	purchase,
	isPlanExpired,
	mode = 'immediate',
	currentRenewalPriceText,
	targetRenewalPriceText,
}: DowngradeConfirmationModalProps ) => {
	const translate = useTranslate();
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) );
	const [ isDowngrading, setIsDowngrading ] = useState( false );
	const dispatch = useDispatch();

	const lostFeatures = useMemo( () => {
		if ( ! targetPlanSlug ) {
			return [];
		}
		const featureSlugs = getFeatureDifference(
			targetPlanSlug,
			currentPlanSlug,
			'getDowngradeFeatures'
		);
		return featureSlugs
			.map( ( slug ) => getFeatureByKey( slug ) )
			.filter( ( feature ): feature is NonNullable< typeof feature > => !! feature );
	}, [ targetPlanSlug, currentPlanSlug ] );

	const refundAmount = useMemo( () => {
		if ( ! purchase || isPlanExpired || ! targetPlanSlug ) {
			return null;
		}
		const targetProductId = getPlan( targetPlanSlug )?.getProductId();
		if ( ! isRefundable( purchase ) || ! Array.isArray( purchase.refundOptions ) ) {
			return null;
		}
		const match = purchase.refundOptions.find( ( opt ) => opt.to_product_id === targetProductId );
		return match ? { amount: match.refund_amount, currency: purchase.currencyCode } : null;
	}, [ purchase, isPlanExpired, targetPlanSlug ] );

	if ( ! targetPlanSlug || ! isOpen ) {
		return null;
	}

	const currentPlanTitle = getPlan( currentPlanSlug )?.getTitle() ?? '';
	const targetPlanTitle = getPlan( targetPlanSlug )?.getTitle() ?? '';

	// When auto-renew is on, expiryDate is the next renewal date.
	// Use non-breaking spaces so the date never wraps mid-line.
	const renewalDateFormatted = purchase?.expiryDate
		? moment( purchase.expiryDate ).format( 'LL' ).replace( / /g, '\u00A0' )
		: '';

	const handleConfirm = async () => {
		if ( isPlanExpired ) {
			// Expired plan: route to checkout
			const planPath = getPlanPath( targetPlanSlug );
			if ( ! planPath || ! siteSlug ) {
				return;
			}
			const checkoutUrl = `/checkout/${ encodeURIComponent( siteSlug ) }/${ planPath }`;
			const cancelTo = window.location.href.replace( window.location.origin, '' );
			const finalUrl = addQueryArgs(
				{
					...( redirectTo && { redirect_to: redirectTo } ),
					cancel_to: cancelTo,
					change_plan: 'true',
				},
				checkoutUrl
			);
			window.location.assign( finalUrl );
			return;
		}

		if ( mode === 'on_renewal' ) {
			// On-renewal: schedule the downgrade for the next renewal date.
			if ( ! purchase || isDowngrading ) {
				return;
			}
			const targetProductId = getPlan( targetPlanSlug )?.getProductId();
			if ( ! targetProductId ) {
				return;
			}

			setIsDowngrading( true );
			try {
				await scheduleDowngradeAsync( purchase.id, targetProductId );

				// Ensure auto-renew is on so the scheduled downgrade triggers at renewal.
				if ( ! purchase.isAutoRenewEnabled ) {
					await new Promise< void >( ( resolve ) => {
						enableAutoRenew( purchase.id, () => resolve() );
					} );
				}

				// Redirect to purchase settings — the page-level notice communicates the schedule.
				// Append downgrade_scheduled=true so purchase settings can render optimistically
				// before the API cache refreshes (same pattern as plan_changed=true).
				const cancelTo = new URLSearchParams( window.location.search ).get( 'cancel_to' );
				if ( cancelTo ) {
					const separator = cancelTo.includes( '?' ) ? '&' : '?';
					window.location.href = cancelTo + separator + 'downgrade_scheduled=true';
				} else {
					window.location.href = `/purchases/subscriptions/${ siteSlug ?? '' }/${
						purchase.id
					}?downgrade_scheduled=true`;
				}
			} catch ( error ) {
				dispatch(
					errorNotice(
						error instanceof Error ? error.message : translate( 'An unknown error occurred' ),
						{ duration: 5000 }
					)
				);
				setIsDowngrading( false );
			}
			return;
		}

		// Active plan (immediate): use cancel API
		if ( ! purchase || isDowngrading ) {
			return;
		}

		const currentPlan = getPlan( currentPlanSlug );
		const targetPlan = getPlan( targetPlanSlug );
		if ( ! currentPlan?.getProductId() || ! targetPlan?.getProductId() ) {
			return;
		}

		setIsDowngrading( true );
		try {
			const result = await cancelAndRefundPurchaseAsync( purchase.id, {
				product_id: currentPlan.getProductId(),
				type: 'downgrade',
				to_product_id: targetPlan.getProductId(),
			} );

			// Redirect to the new plan's purchase settings page.
			// cancel_to points to the old purchase (e.g. /me/purchases/slug/123
			// or http://my.localhost:3000/me/billing/purchases/slug/123).
			// Replace the old purchaseId with the new subscription ID.
			const newPurchaseId = result?.new_subscription_id;
			const cancelTo = new URLSearchParams( window.location.search ).get( 'cancel_to' );
			let targetUrl: string;
			if ( cancelTo && newPurchaseId ) {
				if ( cancelTo.startsWith( 'http' ) ) {
					// Dashboard: full URL — replace the purchaseId segment.
					const url = new URL( cancelTo );
					url.pathname = url.pathname.replace( /\/[^/]+$/, `/${ newPurchaseId }` );
					url.search = '';
					targetUrl = url.href;
				} else {
					// Classic calypso: relative path.
					targetUrl = cancelTo.split( '?' )[ 0 ].replace( /\/[^/]+$/, `/${ newPurchaseId }` );
				}
			} else if ( cancelTo ) {
				// No new_subscription_id — fall back to purchases list.
				if ( cancelTo.startsWith( 'http' ) ) {
					const url = new URL( cancelTo );
					url.pathname = url.pathname.replace( /\/[^/]+$/, '' );
					url.search = '';
					targetUrl = url.href;
				} else {
					targetUrl = cancelTo.split( '?' )[ 0 ].replace( /\/[^/]+$/, '' );
				}
			} else {
				targetUrl = `/purchases/subscriptions/${ siteSlug ?? '' }`;
			}
			// Full-page navigation clears all stale Redux state naturally.
			window.location.href = targetUrl + '?plan_changed=true';
		} catch ( error ) {
			dispatch(
				errorNotice(
					error instanceof Error ? error.message : translate( 'An unknown error occurred' ),
					{ duration: 5000 }
				)
			);
			setIsDowngrading( false );
		}
	};

	const renderDescription = () => {
		if ( mode === 'on_renewal' ) {
			return (
				<>
					<p className="downgrade-confirmation-modal__description">
						{ translate(
							'On %(date)s, your plan will switch from %(currentPlan)s to %(targetPlan)s. The renewal price will change from %(currentPrice)s to %(targetPrice)s.',
							{
								args: {
									date: renewalDateFormatted,
									currentPlan: currentPlanTitle,
									targetPlan: targetPlanTitle,
									currentPrice: currentRenewalPriceText ?? '',
									targetPrice: targetRenewalPriceText ?? '',
								},
								comment:
									'Message shown when scheduling a plan downgrade for the next renewal date, including price change',
							}
						) }
					</p>
					{ lostFeatures.length > 0 && (
						<p className="downgrade-confirmation-modal__description">
							{ translate( 'Your site will lose access to these features:' ) }
						</p>
					) }
				</>
			);
		}

		if ( isPlanExpired ) {
			// Expired plan: show "what you'll lose" copy
			if ( lostFeatures.length > 0 ) {
				return (
					<p className="downgrade-confirmation-modal__description">
						{ translate(
							'When you change from %(currentPlan)s to %(targetPlan)s, here’s what you’ll lose:',
							{
								args: {
									currentPlan: currentPlanTitle,
									targetPlan: targetPlanTitle,
								},
								comment:
									'Message shown when downgrading an expired plan, listing features that will be lost',
							}
						) }
					</p>
				);
			}
			return (
				<p className="downgrade-confirmation-modal__description">
					{ translate(
						'When you change from %(currentPlan)s to %(targetPlan)s, your features will stay the same.',
						{
							args: {
								currentPlan: currentPlanTitle,
								targetPlan: targetPlanTitle,
							},
							comment: 'Message shown when downgrading an expired plan with no feature differences',
						}
					) }
				</p>
			);
		}

		// Active plan: show refund info or immediate change message
		if ( refundAmount ) {
			return (
				<p className="downgrade-confirmation-modal__description">
					{ translate(
						'When you downgrade from %(currentPlan)s to %(targetPlan)s, you’ll receive a refund of %(amount)s to your original payment method.',
						{
							args: {
								currentPlan: currentPlanTitle,
								targetPlan: targetPlanTitle,
								amount: formatCurrency( refundAmount.amount, refundAmount.currency ),
							},
							comment: 'Message shown when downgrading an active plan with a refund available',
						}
					) }
					{ lostFeatures.length > 0 && ' ' }
					{ lostFeatures.length > 0 &&
						translate( 'Your site will lose access to these features:' ) }
				</p>
			);
		}

		if ( lostFeatures.length > 0 ) {
			return (
				<p className="downgrade-confirmation-modal__description">
					{ translate(
						'Your plan will change immediately from %(currentPlan)s to %(targetPlan)s. These features will no longer be available on your site when your plan changes:',
						{
							args: {
								currentPlan: currentPlanTitle,
								targetPlan: targetPlanTitle,
							},
							comment:
								'Message shown when downgrading an active plan, followed by the list of features that will be lost',
						}
					) }
				</p>
			);
		}

		return (
			<p className="downgrade-confirmation-modal__description">
				{ translate( 'Your plan will change immediately from %(currentPlan)s to %(targetPlan)s.', {
					args: {
						currentPlan: currentPlanTitle,
						targetPlan: targetPlanTitle,
					},
					comment: 'Message shown when downgrading an active plan with no refund available',
				} ) }
			</p>
		);
	};

	const modalTitle =
		mode === 'on_renewal'
			? String( translate( 'Downgrade at renewal' ) )
			: String( translate( 'Confirm downgrade' ) );

	return (
		<Modal
			title={ modalTitle }
			onRequestClose={ onClose }
			className="downgrade-confirmation-modal"
			size="medium"
		>
			{ renderDescription() }
			{ lostFeatures.length > 0 && (
				<ul className="downgrade-confirmation-modal__feature-list">
					{ lostFeatures.map( ( feature ) => (
						<li key={ feature.getSlug() } className="downgrade-confirmation-modal__feature-item">
							<Gridicon
								icon="cross-small"
								size={ 24 }
								className="downgrade-confirmation-modal__feature-icon"
							/>
							<span className="downgrade-confirmation-modal__feature-text">
								{ feature.getTitle() }
							</span>
						</li>
					) ) }
				</ul>
			) }
			<HStack spacing={ 3 } justify="flex-end" className="downgrade-confirmation-modal__buttons">
				<Button __next40pxDefaultSize variant="tertiary" onClick={ onClose }>
					{ mode === 'on_renewal'
						? translate( 'Keep my plan' )
						: translate( 'Keep %(planName)s', {
								args: { planName: currentPlanTitle },
								comment: 'Button label to dismiss the downgrade modal and keep the current plan',
						  } ) }
				</Button>
				<Button
					__next40pxDefaultSize
					variant="primary"
					onClick={ handleConfirm }
					isBusy={ isDowngrading }
					disabled={ isDowngrading }
				>
					{ mode === 'on_renewal'
						? translate( 'Downgrade at renewal' )
						: translate( 'Downgrade to %(planName)s', {
								args: { planName: targetPlanTitle },
								comment: 'Button label to confirm downgrading to a lower-tier plan',
						  } ) }
				</Button>
			</HStack>
		</Modal>
	);
};

export default DowngradeConfirmationModal;
