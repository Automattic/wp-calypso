import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getActiveAgency } from 'calypso/state/a8c-for-agencies/agency/selectors';

export default function usePressableOwnershipType() {
	const activeAgency = useSelector( getActiveAgency );

	const pressableOwnership = useMemo( () => {
		// Agencies can have pressable through A4A Licenses or via Pressable itself
		const hasPressablePlan =
			!! activeAgency?.third_party?.pressable?.pressable_id &&
			activeAgency?.third_party?.pressable?.a4a_id;

		return hasPressablePlan ? 'agency' : 'none';
	}, [ activeAgency ] );

	return pressableOwnership;
}
