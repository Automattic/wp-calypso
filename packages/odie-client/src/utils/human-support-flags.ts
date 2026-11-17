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

/**
 * Carries the bot's flags onto a message shown in place of its request for a human, such as the
 * existing-conversation prompt, so a request started from that message keeps them.
 */
export const withHumanSupportFlags = ( message: Message, botMessage: Message ): Message => {
	const { is_emergency, emergency_type, route_to_email } = botMessage.context?.flags ?? {};

	return {
		...message,
		context: {
			site_id: null,
			...message.context,
			flags: {
				...message.context?.flags,
				...( is_emergency !== undefined && { is_emergency } ),
				...( emergency_type !== undefined && { emergency_type } ),
				...( route_to_email !== undefined && { route_to_email } ),
			},
		},
	};
};
