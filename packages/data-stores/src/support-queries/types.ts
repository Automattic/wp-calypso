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

export interface OtherSupportAvailability {
	is_user_eligible_for_upwork: boolean;
	is_user_eligible_for_kayako: boolean;
	is_user_eligible_for_directly: boolean;
}
