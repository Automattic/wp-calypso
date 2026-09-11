import { userPurchaseSetAutoRenewQuery } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@wordpress/components';
import { useEffect, useMemo } from 'react';
import { getCalendarDaysUntil } from '../../utils/datetime';
import { isExpiredOrRemoved, mightStillAutoRenew } from '../../utils/purchase';
import Notice from '../notice';
import { getExpiryStateName, getPlanExpiryNotice } from './get-plan-expiry-notice';
import type {
	PlanExpiryNoticeAction,
	PlanExpiryNoticeScope,
	PlanExpiryNoticeStage,
} from './get-plan-expiry-notice';
import type { Purchase } from '@automattic/api-core';

export {
	getExpiryStateName,
	getPlanExpiryNotice,
	getPlanExpiryUrgency,
	getSitewideExpiryStage,
	hasPlanExpiryNotice,
	isEligibleForPlanExpiryNotice,
	pickSitewideExpiryPurchase,
	NOTICE_CUTOFF_DAYS_PAST_EXPIRY,
} from './get-plan-expiry-notice';
export type {
	PlanExpiryNoticeAction,
	PlanExpiryNoticeContent,
	PlanExpiryNoticeOptions,
	PlanExpiryNoticeScope,
	PlanExpiryNoticeStage,
	PlanExpiryStateName,
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

	/** See `PlanExpiryNoticeOptions.scope`. */
	scope?: PlanExpiryNoticeScope;

	/** See `PlanExpiryNoticeOptions.isReverted`. */
	isReverted?: boolean;

	/** See `PlanExpiryNoticeOptions.isPlanOwner`. */
	isPlanOwner?: boolean;

	/** See `PlanExpiryNoticeOptions.stage`. */
	stage?: PlanExpiryNoticeStage;

	/** Renders a close button. The caller owns the dismissal; the notice keeps rendering until unmounted. */
	onClose?: () => void;

	/** Opens the host's Help Center with a prefilled message. Without it the action is not offered. */
	onContactSupport?: ( message: string ) => void;

	/** Extra properties for every event this notice records. */
	eventProperties?: Record< string, unknown >;
}

function PlanExpiryNoticeButton( {
	action,
	variant,
	purchaseId,
	addPaymentMethodUrl,
	onClick,
	onAutoRenewEnabled,
	onContactSupport,
}: {
	action: PlanExpiryNoticeAction;
	variant: 'primary' | 'secondary';
	purchaseId: number;
	addPaymentMethodUrl?: string;
	onClick: () => void;
	onAutoRenewEnabled?: () => void;
	onContactSupport?: ( message: string ) => void;
} ) {
	const { mutate: setAutoRenew, isPending } = useMutation( userPurchaseSetAutoRenewQuery() );

	if ( action.type === 'contact-support' ) {
		return (
			<Button
				variant={ variant }
				onClick={ () => {
					onClick();
					onContactSupport?.( action.message );
				} }
			>
				{ action.label }
			</Button>
		);
	}

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

	const href = action.type === 'add-payment-method' ? addPaymentMethodUrl : action.href;

	return (
		<Button variant={ variant } href={ href } onClick={ onClick }>
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
	scope,
	isReverted,
	isPlanOwner: isPlanOwnerProp,
	stage: stageOverride,
	onClose,
	onContactSupport,
	eventProperties: extraEventProperties,
}: PlanExpiryNoticeProps ) {
	const notice = getPlanExpiryNotice( purchase, {
		viewOtherPlansUrl,
		locale,
		renewReturnUrl,
		scope,
		isReverted,
		isPlanOwner: isPlanOwnerProp,
		stage: stageOverride,
	} );

	// Pulled out as primitives so that they, and the memo below, stay stable
	// across renders. `purchase` and `notice` are both new objects every time,
	// and so is an inline `extraEventProperties`, hence its JSON key.
	const purchaseId = purchase.ID;
	const productSlug = purchase.product_slug;
	const status = isExpiredOrRemoved( purchase ) ? 'expired' : 'active';
	const daysUntilExpiry = getCalendarDaysUntil( new Date( purchase.expiry_date ) );
	const canStillAutoRenew = mightStillAutoRenew( purchase );
	const variant = notice?.variant;
	const stage = notice?.stage;
	const isPlanOwner = isPlanOwnerProp ?? true;
	const extraEventPropertiesKey = JSON.stringify( extraEventProperties ?? {} );

	const eventProperties = useMemo(
		() => ( {
			...extraEventProperties,
			surface,
			purchase_id: purchaseId,
			product_slug: productSlug,
			status,
			days_until_expiry: daysUntilExpiry,
			days_remaining: daysUntilExpiry,
			might_still_auto_renew: canStillAutoRenew,
			variant,
			stage,
			state: stage ? getExpiryStateName( stage ) : undefined,
			is_plan_owner: isPlanOwner,
		} ),
		// eslint-disable-next-line react-hooks/exhaustive-deps -- extraEventPropertiesKey stands in for extraEventProperties.
		[
			surface,
			purchaseId,
			productSlug,
			status,
			daysUntilExpiry,
			canStillAutoRenew,
			variant,
			stage,
			isPlanOwner,
			extraEventPropertiesKey,
		]
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
	const shown = ( action?: PlanExpiryNoticeAction ) => {
		if ( ! action ) {
			return undefined;
		}
		if ( action.type === 'add-payment-method' && ! addPaymentMethodUrl ) {
			return undefined;
		}
		if ( action.type === 'contact-support' && ! onContactSupport ) {
			return undefined;
		}
		return action;
	};
	const primaryAction = shown( notice.primaryAction );
	const secondaryAction = shown( notice.secondaryAction );

	const recordClick = ( action: PlanExpiryNoticeAction, slot: 'primary' | 'secondary' ) =>
		recordTracksEvent( 'calypso_purchases_plan_expiry_notice_click', {
			...eventProperties,
			action: action.type,
			cta: action.type === 'contact-support' ? 'support' : slot,
		} );

	return (
		<Notice
			variant={ notice.variant }
			title={ notice.title }
			onClose={ onClose }
			actions={
				( primaryAction || secondaryAction ) && (
					<>
						{ primaryAction && (
							<PlanExpiryNoticeButton
								action={ primaryAction }
								variant="primary"
								purchaseId={ purchase.ID }
								addPaymentMethodUrl={ addPaymentMethodUrl }
								onClick={ () => recordClick( primaryAction, 'primary' ) }
								onAutoRenewEnabled={ onAutoRenewEnabled }
								onContactSupport={ onContactSupport }
							/>
						) }
						{ secondaryAction && (
							<PlanExpiryNoticeButton
								action={ secondaryAction }
								variant="secondary"
								purchaseId={ purchase.ID }
								addPaymentMethodUrl={ addPaymentMethodUrl }
								onClick={ () => recordClick( secondaryAction, 'secondary' ) }
								onAutoRenewEnabled={ onAutoRenewEnabled }
								onContactSupport={ onContactSupport }
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
