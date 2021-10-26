import { isE2ETest } from 'calypso/lib/e2e';
import { useIsAnchorFm } from '../path';
import useFseBetaEligibility from './use-fse-beta-eligibility';

export default function useFseBetaOptInStep(): boolean {
	const isAnchorFm = useIsAnchorFm();
	const isFseBetaEligible = useFseBetaEligibility();

	const canUseFseBetaOptInStep = isFseBetaEligible && ! isAnchorFm && ! isE2ETest();

	return canUseFseBetaOptInStep;
}
