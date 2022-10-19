interface Availability {
	presale: boolean;
	precancellation: boolean;
}

export interface HappyChatAvailability {
	locale: string;
	is_user_eligible: boolean;
	supportLevel:
		| 'free'
		| 'personal'
		| 'personal-with-legacy-chat'
		| 'premium'
		| 'pro'
		| 'business'
		| 'ecommerce'
		| 'jetpack-paid'
		| 'p2-plus';
	nickname: string;
	is_chat_closed: boolean;
	availability: Availability;
}

export interface OtherSupportAvailability {
	is_user_eligible_for_upwork: boolean;
	is_user_eligible_for_tickets: boolean;
	is_user_eligible_for_chat: boolean;
}
