import { isEnabled } from '@automattic/calypso-config';
import { useExperiment } from 'calypso/lib/explat';

const EXPERIMENT_NAME = 'calypso_new_cancel_refund_flow_20260408';

export function useIsSplitCancelRemoveEnabled(): boolean {
	const [ isLoadingExperiment, experimentAssignment ] = useExperiment( EXPERIMENT_NAME );
	return (
		isEnabled( 'purchases/split-cancel-remove' ) ||
		( ! isLoadingExperiment && experimentAssignment?.variationName === 'treatment' )
	);
}
