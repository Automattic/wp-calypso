import { getUrlParts } from '@automattic/calypso-url';
import { type SupportedIntervalTypes, supportedIntervalTypes } from './supported-interval-types';

export const getIntervalType = (
	path?: string,
	defaultType = 'yearly'
): SupportedIntervalTypes => {
	const url = path ?? window?.location?.href ?? '';
	const intervalType = getUrlParts( url ).searchParams.get( 'intervalType' ) || defaultType;

	return (
		supportedIntervalTypes.includes( intervalType as SupportedIntervalTypes )
			? intervalType
			: defaultType
	) as SupportedIntervalTypes;
};
