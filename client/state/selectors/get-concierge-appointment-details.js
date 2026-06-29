import 'calypso/state/concierge/init';

export default ( state, appointmentId ) =>
	state?.concierge?.appointmentDetails?.[ appointmentId ] ?? null;
