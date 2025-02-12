import 'calypso/state/concierge/init';
import { AppState } from 'calypso/types';

export interface NextAppointment {
	id: number;
	siteId: number;
	scheduleId: number;
}

export default ( state: AppState ): NextAppointment | null =>
	state.concierge?.nextAppointment ?? null;
