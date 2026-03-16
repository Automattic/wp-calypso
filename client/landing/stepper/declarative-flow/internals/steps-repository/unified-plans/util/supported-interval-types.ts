import { type UrlFriendlyTermType } from '@automattic/calypso-products';

export type SupportedIntervalTypes = Extract<
	UrlFriendlyTermType,
	'monthly' | 'yearly' | '2yearly' | '3yearly'
>;

export const supportedIntervalTypes: SupportedIntervalTypes[] = [
	'monthly',
	'yearly',
	'2yearly',
	'3yearly',
];
