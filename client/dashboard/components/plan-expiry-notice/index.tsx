import { userPurchaseSetAutoRenewQuery } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@wordpress/components';
import { useEffect, useMemo } from 'react';
import { getCalendarDaysUntil } from '../../utils/datetime';
import { isExpiredOrRemoved, mightStillAutoRenew } from '../../utils/purchase';
import Notice from '../notice';
import { getPlanExpiryNotice } from './get-plan-expiry-notice';
import type { PlanExpiryNoticeAction } from './get-plan-expiry-notice';
import type { Purchase } from '@automattic/api-core';

export {
	getPlanExpiryNotice,
	getPlanExpiryUrgency,
	hasPlanExpiryNotice,
	isEligibleForPlanExpiryNotice,
} from './get-plan-expiry-notice';
export type {
	PlanExpiryNoticeContent,
	PlanExpiryNoticeOptions,
	PlanExpiryUrgency,
} from './get-plan-expiry-notice';

interface PlanExpiryNoticeProps {
	purchase: Purchase;

	/**
	 * Where to send someone who needs to attach a payment method to this
	 * purchase. Calypso and the dashboard route to this differently, so the
	 * caller supplies it. Omit it when the purchase's payment details can't be
	 * edited; the notice then explains the problem without offering a fix.
	 */
	addPaymentMethodUrl?: string;

	/**
	 * Where to send someone who would rather move to a different plan than renew
	 * this one. Omit it when the purchase has no such destination; the action
	 * then isn't offered.
	 */
	viewOtherPlansUrl?: string;

	/**
	 * The viewer's locale, for the expiration dates in the copy. Supplied by the
	 * caller because the dashboard's `useLocale` reads app context that Calypso
	 * doesn't have.
	 */
	locale: string;

	/**
	 * Where renewal checkout returns to. Defaults to the dashboard page the user
	 * is on, so surfaces outside the dashboard have to say where they are.
	 */
	renewReturnUrl?: string;

	/**
	 * Which page is rendering the notice, recorded with its events so that the
	 * surfaces can be told apart in the data.
	 */
	surface: string;

	/**
	 * Taken as a prop because the dashboard's analytics context is not available
	 * to callers outside the dashboard. Each host passes its own.
	 */
	recordTracksEvent: ( eventName: string, properties?: Record< string, unknown > ) => void;

	/**
	 * Called once auto-renew has been turned on. The mutation invalidates the
	 * `@automattic/api-queries` client, which is only the one the page is reading
	 * from inside the dashboard app; hosts with a query client of their own have
	 * to refresh the purchase themselves or the page will not update.
	 */
	onAutoRenewEnabled?: () => void;
}

function PlanExpiryNoticeButton( {
	action,
	variant,
	purchaseId,
	addPaymentMethodUrl,
	onClick,
	onAutoRenewEnabled,
}: {
	action: PlanExpiryNoticeAction;
	variant: 'primary' | 'secondary';
	purchaseId: number;
	addPaymentMethodUrl?: string;
	onClick: () => void;
	onAutoRenewEnabled?: () => void;
} ) {
	const { mutate: setAutoRenew, isPending } = useMutation( userPurchaseSetAutoRenewQuery() );

	if ( action.type === 'enable-auto-renew' ) {
		return (
			<Button
				variant={ variant }
				disabled={ isPending }
				isBusy={ isPending }
				onClick={ () => {
					onClick();
					setAutoRenew(
						{ purchaseId, autoRenew: true },
						{ onSuccess: () => onAutoRenewEnabled?.() }
					);
				} }
			>
				{ action.label }
			</Button>
		);
	}

	return (
		<Button
			variant={ variant }
			href={ action.type === 'add-payment-method' ? addPaymentMethodUrl : action.href }
			onClick={ onClick }
		>
			{ action.label }
		</Button>
	);
}

/**
 * A prominent notice for a WordPress.com plan that is approaching or past its
 * expiration date, or is otherwise at risk of not renewing. Renders nothing for
 * any other purchase, or when the plan is renewing normally.
 *
 * Deliberately free of assumptions about its surroundings so that it can be
 * rendered from both Calypso and the dashboard: it takes host-specific
 * destinations as props and reaches for no app context of its own.
 */
export function PlanExpiryNotice( {
	purchase,
	addPaymentMethodUrl,
	viewOtherPlansUrl,
	locale,
	renewReturnUrl,
	surface,
	recordTracksEvent,
	onAutoRenewEnabled,
}: PlanExpiryNoticeProps ) {
	const notice = getPlanExpiryNotice( purchase, {
		viewOtherPlansUrl,
		locale,
		renewReturnUrl,
	} );

	// Pulled out as primitives so that they, and the memo below, stay stable
	// across renders. `purchase` and `notice` are both new objects every time.
	const purchaseId = purchase.ID;
	const productSlug = purchase.product_slug;
	const status = isExpiredOrRemoved( purchase ) ? 'expired' : 'active';
	const daysUntilExpiry = getCalendarDaysUntil( new Date( purchase.expiry_date ) );
	const canStillAutoRenew = mightStillAutoRenew( purchase );
	const variant = notice?.variant;

	const eventProperties = useMemo(
		() => ( {
			surface,
			purchase_id: purchaseId,
			product_slug: productSlug,
			status,
			days_until_expiry: daysUntilExpiry,
			might_still_auto_renew: canStillAutoRenew,
			variant,
		} ),
		[ surface, purchaseId, productSlug, status, daysUntilExpiry, canStillAutoRenew, variant ]
	);

	// Records again whenever any of the above changes, since that means the
	// reader is being shown a different message.
	useEffect( () => {
		if ( ! variant ) {
			return;
		}
		recordTracksEvent( 'calypso_purchases_plan_expiry_notice_impression', eventProperties );
	}, [ eventProperties, variant, recordTracksEvent ] );

	if ( ! notice ) {
		return null;
	}

	// Kept out of the buttons themselves: the notice has to know whether it has
	// any action at all, or it renders an empty, padded action row.
	const shown = ( action?: PlanExpiryNoticeAction ) =>
		action && ( action.type !== 'add-payment-method' || addPaymentMethodUrl ) ? action : undefined;
	const primaryAction = shown( notice.primaryAction );
	const secondaryAction = shown( notice.secondaryAction );

	const recordClick = ( action: PlanExpiryNoticeAction ) =>
		recordTracksEvent( 'calypso_purchases_plan_expiry_notice_click', {
			...eventProperties,
			action: action.type,
		} );

	return (
		<Notice
			variant={ notice.variant }
			title={ notice.title }
			actions={
				( primaryAction || secondaryAction ) && (
					<>
						{ primaryAction && (
							<PlanExpiryNoticeButton
								action={ primaryAction }
								variant="primary"
								purchaseId={ purchase.ID }
								addPaymentMethodUrl={ addPaymentMethodUrl }
								onClick={ () => recordClick( primaryAction ) }
								onAutoRenewEnabled={ onAutoRenewEnabled }
							/>
						) }
						{ secondaryAction && (
							<PlanExpiryNoticeButton
								action={ secondaryAction }
								variant="secondary"
								purchaseId={ purchase.ID }
								addPaymentMethodUrl={ addPaymentMethodUrl }
								onClick={ () => recordClick( secondaryAction ) }
								onAutoRenewEnabled={ onAutoRenewEnabled }
							/>
						) }
					</>
				)
			}
		>
			{ notice.body }
		</Notice>
	);
}

export default PlanExpiryNotice;
