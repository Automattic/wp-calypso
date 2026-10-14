import { createContext, useContext } from 'react';
import type { NamePulseResultGroup } from '../helpers';

/** The result set on screen. Unset while typing, so no render is reported for a stale set. */
export const NamePulseResultSetContext = createContext< string | undefined >( undefined );

export const useNamePulseResultSetId = () => useContext( NamePulseResultSetContext );

/** Where a name rendered. Its later events reuse this. */
export interface NamePulseRenderReport {
	resultSetId: string;
	group: NamePulseResultGroup;
	position: number;
}
