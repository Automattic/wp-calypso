import type { HumanSupportFlags, Message } from '../types';

export const NO_HUMAN_SUPPORT_FLAGS: HumanSupportFlags = {
	isEmergency: false,
	emergencyType: null,
	routeToEmail: false,
};

/** The flags the bot sent with a request for a human. */
export const getHumanSupportFlags = ( message?: Message ): HumanSupportFlags => {
	const flags = message?.context?.flags;

	return {
		isEmergency: !! flags?.is_emergency,
		emergencyType: flags?.emergency_type ?? null,
		routeToEmail: !! flags?.route_to_email,
	};
};

/** The flags of the latest bot message that asked for a human, for requests the user starts. */
export const getLatestHumanSupportFlags = ( messages: Message[] = [] ): HumanSupportFlags => {
	const message = messages.findLast( ( { context } ) => context?.flags?.forward_to_human_support );

	return message ? getHumanSupportFlags( message ) : NO_HUMAN_SUPPORT_FLAGS;
};
