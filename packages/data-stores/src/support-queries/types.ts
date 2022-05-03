interface Availability {
	presale: boolean;
	precancellation: boolean;
}

export interface HappyChatAvailability {
	locale: string;
	isUserEligible: boolean;
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
	isClosed: boolean;
	availability: Availability;
}

export interface EmailSupportAvailability {
	is_user_eligible: boolean;
}
