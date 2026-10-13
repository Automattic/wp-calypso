import { createContext, useContext } from 'react';

/**
 * The result set on screen, for TrainTracks. Unset while the query is still
 * being typed, so a cached verdict never reports a render for a stale set.
 */
export const NamePulseResultSetContext = createContext< string | undefined >( undefined );

export const useNamePulseResultSetId = () => useContext( NamePulseResultSetContext );
