export interface StoredCard {
	added: string;
	card: string;
	card_type: string;
	email: string;
	expiry: string;
	last_service: string;
	last_used: string;
	mp_ref: string;
	name: string;
	payment_partner: string;
	remember: string;
	stored_details_id: string;
	user_id: string;
	meta: StoredCardMeta[];
}

export interface StoredCardMeta {
	meta_key: string;
	meta_value: string;
	stored_details_id: string;
}
