import { createContext, useContext } from 'react';
import type { NamePulseResultGroup } from '../helpers';

/** Where a name rendered. Its later events reuse this. */
export interface NamePulseRenderReport {
	resultSetId: string;
	group: NamePulseResultGroup;
	position: number;
}

export interface NamePulseResultSet {
	/** Unset while typing, so no render is reported for a stale set. */
	id?: string;
	/** Renders reported for this result set. Kept here, as rows remount on every keystroke. */
	rendered: Map< string, NamePulseRenderReport >;
}

export const NamePulseResultSetContext = createContext< NamePulseResultSet | undefined >(
	undefined
);

export const useNamePulseResultSet = () => useContext( NamePulseResultSetContext );

/** The same name can appear in two sections, and renders in each. */
export const getNamePulseRenderKey = ( group: NamePulseResultGroup, domainName: string ) =>
	`${ group }:${ domainName }`;
