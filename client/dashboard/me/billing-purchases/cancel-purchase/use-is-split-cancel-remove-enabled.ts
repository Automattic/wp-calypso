import { isEnabled } from '@automattic/calypso-config';
import { useExperiment } from 'calypso/lib/explat';
import { shouldUseSplitCancelRemoveFlow } from '../../../utils/purchase';
import type { Purchase } from '@automattic/api-core';

const EXPERIMENT_NAME = 'calypso_new_cancel_refund_flow_20260408';

export function useIsSplitCancelRemoveEnabled( purchase: Purchase ): boolean {
	const [ isLoadingExperiment, experimentAssignment ] = useExperiment( EXPERIMENT_NAME );
	const isInTreatment =
		isEnabled( 'purchases/split-cancel-remove' ) ||
		( ! isLoadingExperiment && experimentAssignment?.variationName === 'treatment' );
	return shouldUseSplitCancelRemoveFlow( purchase, isInTreatment );
}
