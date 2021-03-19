export const ITEM_TYPE_RADIO = 'radio';
export const ITEM_TYPE_BUTTON = 'button';
export const ITEM_TYPE_INDIVIDUAL_ITEM = 'individual-item';
export type SUGGESTION_ITEM_TYPE =
	| typeof ITEM_TYPE_RADIO
	| typeof ITEM_TYPE_BUTTON
	| typeof ITEM_TYPE_INDIVIDUAL_ITEM;
