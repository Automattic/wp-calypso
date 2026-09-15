import {
	cancelAndRefundPurchaseMutation,
	domainQuery,
	setDelayedDowngradeMutation,
	sitePurchasesQuery,
} from '@automattic/api-queries';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { useCallback } from 'react';
import { withSnackbar } from '../../app/snackbars/with-snackbar';
import { isExpiredOrRemoved, isTitanMail } from '../../utils/purchase';
import { getTitanTierFromSlug } from '../utils/titan-tiers';
import type { TitanPlanTier } from '../types';
import type { Domain, Purchase } from '@automattic/api-core';

/**
 * Which downgrade endpoint applies, decided by the server:
 *
 * - `instant`: inside the refund window. Switches tier now and refunds the
 *   difference.
 * - `delayed`: outside it. Schedules the switch for the end of the current
 *   term, with no refund or credit.
 */
export type TitanDowngradeMode = 'instant' | 'delayed';

export function useTitanDowngrade( {
	domain,
	domainName,
	enabled = true,
}: {
	domain: Domain | undefined;
	domainName: string;
	// False on the plain "buy email" visit, where there is no subscription to
	// change and fetching the site's purchases would be a wasted request.
	enabled?: boolean;
} ) {
	const queryClient = useQueryClient();
	const siteId = domain?.blog_id;

	const { data: sitePurchases } = useQuery( {
		...sitePurchasesQuery( siteId ?? 0 ),
		enabled: enabled && Boolean( siteId ),
	} );

	// Titan is one subscription per domain, and `meta` holds that domain.
	const purchase: Purchase | undefined = sitePurchases?.find(
		( sitePurchase ) => isTitanMail( sitePurchase ) && sitePurchase.meta === domainName
	);

	// is_instant_downgrade_available is true even when the refund is worth
	// nothing (comped, 100%-off coupon, credits), so the mode comes from it
	// rather than from refund_options, which is only read for the amount.
	const mode: TitanDowngradeMode = purchase?.is_instant_downgrade_available ? 'instant' : 'delayed';

	const getRefundAmount = useCallback(
		( toProductId: number ) =>
			purchase?.refund_options?.find( ( option ) => option.to_product_id === toProductId )
				?.refund_amount ?? 0,
		[ purchase ]
	);

	// The mutations invalidate the [ 'upgrades' ] key, which covers every
	// purchase query. The domain is not under that key and holds the
	// titan_mail_subscription slug the grid reads its current tier from.
	// Passed per call, since an onSuccess on useMutation would replace the
	// factory's own.
	const invalidateAfterDowngrade = useCallback(
		() => queryClient.invalidateQueries( domainQuery( domainName ) ),
		[ queryClient, domainName ]
	);

	const { mutate: mutateInstantDowngrade, isPending: isInstantDowngradePending } = useMutation(
		withSnackbar( cancelAndRefundPurchaseMutation(), {
			success: __( 'Your plan has been changed.' ),
			error: { source: 'server' },
		} )
	);

	const { mutate: mutateDelayedDowngrade, isPending: isDelayedDowngradePending } = useMutation(
		withSnackbar( setDelayedDowngradeMutation(), {
			success: __( 'Your plan change has been scheduled.' ),
			error: { source: 'server' },
		} )
	);

	const { mutate: mutateCancelDowngrade, isPending: isCancelDowngradePending } = useMutation(
		withSnackbar( setDelayedDowngradeMutation(), {
			success: __( 'Your scheduled plan change has been cancelled.' ),
			error: { source: 'server' },
		} )
	);

	const downgrade = useCallback(
		( toProductId: number, { onSuccess }: { onSuccess?: () => void } = {} ) => {
			if ( ! purchase ) {
				return;
			}

			const onDowngraded = async () => {
				await invalidateAfterDowngrade();
				onSuccess?.();
			};

			if ( mode === 'instant' ) {
				mutateInstantDowngrade(
					{
						purchaseId: purchase.ID,
						options: { type: 'downgrade', to_product_id: toProductId },
					},
					{ onSuccess: onDowngraded }
				);
				return;
			}

			mutateDelayedDowngrade(
				{ purchaseId: purchase.ID, enabled: true, toProductId },
				{ onSuccess: onDowngraded }
			);
		},
		[ purchase, mode, invalidateAfterDowngrade, mutateInstantDowngrade, mutateDelayedDowngrade ]
	);

	const cancelDowngrade = useCallback( () => {
		if ( purchase ) {
			mutateCancelDowngrade(
				{ purchaseId: purchase.ID, enabled: false },
				{ onSuccess: () => invalidateAfterDowngrade() }
			);
		}
	}, [ purchase, invalidateAfterDowngrade, mutateCancelDowngrade ] );

	// Stays set until the renewal applies the change, so the grid can offer to
	// cancel it instead of repeating the downgrade. The tier only labels which
	// card shows that action; the flag is what says a downgrade is scheduled.
	const isDowngradePending = Boolean( purchase?.is_delayed_downgrade_pending );
	const pendingDowngradeTier: TitanPlanTier | undefined = isDowngradePending
		? getTitanTierFromSlug( purchase?.delayed_downgrade_to_product_slug ?? undefined )
		: undefined;

	return {
		purchase,
		mode,
		getRefundAmount,
		downgrade,
		cancelDowngrade,
		isDowngradePending,
		pendingDowngradeTier,
		isDowngrading: isInstantDowngradePending || isDelayedDowngradePending,
		isCancellingDowngrade: isCancelDowngradePending,
		// An expired or removed subscription has nothing to downgrade.
		canDowngrade: Boolean( purchase && ! isExpiredOrRemoved( purchase ) ),
	};
}
