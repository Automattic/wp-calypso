import { useMemo } from 'react';
import { AllowedTypes, RowMetaData, SiteData } from '../../types';
import getLinks from '../lib/get-links';
import getRowEventName from '../lib/get-row-event-name';
import useIsMultisiteSupported from './use-is-multisite-supported';
import useTooltip from './use-tooltip';

/**
 * Returns an object which holds meta data required to format
 * the row
 */
const useRowMetadata = (
	rows: SiteData,
	type: AllowedTypes,
	isLargeScreen: boolean
): RowMetaData => {
	const isSupported = useIsMultisiteSupported( rows.site?.value, type );

	const row = rows[ type ];
	const tooltip = useTooltip( type, rows );

	return useMemo( () => {
		const siteUrl = rows.site?.value?.URL;
		const siteUrlWithScheme = '';
		const siteId = rows.site?.value?.ID;

		const { link, isExternalLink } = getLinks(
			type,
			rows?.status,
			siteUrl,
			siteUrlWithScheme,
			!! rows.site?.value?.is_wpcom_atomic
		);
		const eventName = getRowEventName( type, rows?.status, isLargeScreen );

		return {
			row,
			link: isSupported ? link : '',
			isExternalLink,
			tooltip,
			tooltipId: `${ siteId }-${ type }`,
			siteDown: false,
			eventName,
			isSupported,
		};
	}, [
		isLargeScreen,
		isSupported,
		row,
		rows.site?.value?.ID,
		rows.site?.value?.is_wpcom_atomic,
		rows.site?.value?.URL,
		tooltip,
		type,
	] );
};

export default useRowMetadata;
