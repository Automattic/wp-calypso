import { UrlFriendlyTermType } from '@automattic/calypso-products';
import { getUrlParts } from '@automattic/calypso-url';

type SupportedIntervalTypes = Extract<
	UrlFriendlyTermType,
	'monthly' | 'yearly' | '2yearly' | '3yearly'
>;
const supportedIntervalTypes: SupportedIntervalTypes[] = [
	'monthly',
	'yearly',
	'2yearly',
	'3yearly',
];

export const getIntervalType = ( path?: string ): SupportedIntervalTypes => {
	const url = path ?? window?.location?.href ?? '';
	const intervalType = getUrlParts( url ).searchParams.get( 'intervalType' ) || 'yearly';

	return (
		supportedIntervalTypes.includes( intervalType as SupportedIntervalTypes )
			? intervalType
			: 'yearly'
	) as SupportedIntervalTypes;
};
