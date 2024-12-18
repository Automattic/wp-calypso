import 'calypso/state/concierge/init';
import type { AppState } from 'calypso/types';

export default ( state: AppState ): number[] => state?.concierge?.availableSessions || [];
