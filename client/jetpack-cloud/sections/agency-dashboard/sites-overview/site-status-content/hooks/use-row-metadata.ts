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
		const siteUrl = rows.site?.value?.url;
		const siteUrlWithScheme = rows.site?.value?.url_with_scheme;
		const siteId = rows.site?.value?.blog_id;

		const { link, isExternalLink } = getLinks(
			type,
			row.status,
			siteUrl,
			siteUrlWithScheme,
			rows.site?.value?.is_atomic
		);
		const eventName = getRowEventName( type, row.status, isLargeScreen );

		return {
			row,
			link: ! isSupported ? '' : link,
			isExternalLink,
			tooltip,
			tooltipId: `${ siteId }-${ type }`,
			siteDown: rows.monitor.error,
			eventName,
			isSupported,
		};
	}, [
		isLargeScreen,
		isSupported,
		row,
		rows.monitor.error,
		rows.site?.value?.blog_id,
		rows.site?.value?.is_atomic,
		rows.site?.value?.url,
		rows.site?.value?.url_with_scheme,
		tooltip,
		type,
	] );
};

export default useRowMetadata;
