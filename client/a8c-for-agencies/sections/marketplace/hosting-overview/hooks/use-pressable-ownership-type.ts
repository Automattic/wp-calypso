import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getActiveAgency } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { getPressableOwnershipType } from '../../lib/get-pressable-ownership-type';

export default function usePressableOwnershipType() {
	const activeAgency = useSelector( getActiveAgency );

	return useMemo( () => getPressableOwnershipType( activeAgency ), [ activeAgency ] );
}
