import { Badge } from '@automattic/components';
import { useTranslate, numberFormat } from 'i18n-calypso';
import moment from 'moment';
import { useMemo } from 'react';
import { LogType, PHPLog, ServerLog } from 'calypso/data/hosting/use-site-logs-query';
import { useSelector } from 'calypso/state';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import { useCurrentSiteGmtOffset } from './use-current-site-gmt-offset';
import type { Field, Operator } from '@wordpress/dataviews';

const getLabelCached = (cached: string) => {
	switch (cached) {
		case 'false':
			return 'False';
		case 'true':
			return 'True';
		default:
			return cached;
	}
};
const getLabelRenderer = (renderer: string) => {
	switch (renderer) {
		case 'php':
			return 'PHP';
		case 'static':
			return 'Static';
		default:
			return renderer;
	}
};
export const VALUES_CACHED = ['false', 'true'];
export const VALUES_RENDERER = ['php', 'static'];
export const VALUES_REQUEST_TYPE = ['GET', 'HEAD', 'POST', 'PUT', 'DELETE'];
export const VALUES_SEVERITY = ['User', 'Warning', 'Deprecated', 'Fatal error'];
export const VALUES_STATUS = ['200', '301', '302', '400', '401', '403', '404', '429', '500'];

const useFields = ({ logType }: { logType: LogType }): Field<ServerLog | PHPLog>[] => {
	const translate = useTranslate();
	const locale = useSelector(getCurrentUserLocale);
	const siteGmtOffset = useCurrentSiteGmtOffset();
	const siteGsmOffsetDisplay =
		siteGmtOffset === 0 ? 'UTC' : `UTC${siteGmtOffset > 0 ? '+' : ''}${siteGmtOffset}`;

	const getFormattedDate = useMemo(
		() => (value: string) => {
			const dateFormat = locale === 'en' ? 'll [at] h:mm A' : 'h:mm A, ll';
			const formattedDate = moment(value)
				.utcOffset(siteGmtOffset * 60)
				.format(dateFormat);
			return <span>{formattedDate}</span>;
		},
		[locale, siteGmtOffset]
	);

	const fields = useMemo(() => {
		if (logType === LogType.PHP) {
			return [
				{
					id: 'timestamp',
					type: 'date',
					// translators: %(siteGsmOffsetDisplay)s will be replaced with the timezone offset of the site, e.g. GMT, GMT +1, GMT -1.
					label: translate('Date & time (%(siteGsmOffsetDisplay)s)', {
						args: { siteGsmOffsetDisplay },
					}),
					render: ({ item }: { item: PHPLog }) => getFormattedDate(item.timestamp),
					enableHiding: false,
				},
				{
					id: 'severity',
					type: 'text',
					label: translate('Severity'),
					elements: VALUES_SEVERITY.map((severity) => ({ value: severity, label: severity })),
					filterBy: {
						operators: ['isAny' as Operator],
					},
					render: ({ item }: { item: PHPLog }) => {
						const severity = item.severity;
						return <Badge className={`badge--${severity}`}>{severity}</Badge>;
					},
					enableSorting: false,
				},
				{
					id: 'message',
					type: 'text',
					label: translate('Message'),
					render: ({ item }: { item: PHPLog }) => {
						return <span className="site-logs-table__message">{item.message}</span>;
					},
					enableSorting: false,
				},
				{ id: 'kind', type: 'text', label: translate('Kind'), enableSorting: false },
				{ id: 'name', type: 'text', label: translate('Name'), enableSorting: false },
				{
					id: 'file',
					type: 'text',
					label: translate('File'),
					render: ({ item }: { item: PHPLog }) => {
						return <span className="site-logs-table__file">{item.file}</span>;
					},
					enableSorting: false,
				},
				{
					id: 'line',
					type: 'integer',
					label: translate('Line'),
					render: ({ item }: { item: PHPLog }) => numberFormat(item.line),
					enableSorting: false,
				},
			] as Field<PHPLog | ServerLog>[];
		}

		return [
			{
				id: 'date',
				type: 'datetime',
				// translators: %(siteGsmOffsetDisplay)s will be replaced with the timezone offset of the site, e.g. GMT, GMT +1, GMT -1.
				label: translate('Date & time (%(siteGsmOffsetDisplay)s)', {
					args: { siteGsmOffsetDisplay },
				}),
				render: ({ item }: { item: ServerLog }) => getFormattedDate(item.date),
				enableHiding: false,
			},
			{
				id: 'request_type',
				type: 'text',
				label: translate('Request type'),
				elements: VALUES_REQUEST_TYPE.map((type) => ({ value: type, label: type })),
				filterBy: {
					operators: ['isAny' as Operator],
				},
				render: ({ item }: { item: ServerLog }) => {
					const requestType = item.request_type;
					return <Badge className={`badge--${requestType}`}>{requestType}</Badge>;
				},
				enableSorting: false,
			},
			{
				id: 'status',
				type: 'text',
				label: translate('Status'),
				elements: VALUES_STATUS.map((status) => ({ value: status, label: status })),
				filterBy: {
					operators: ['isAny' as Operator],
				},
				enableSorting: false,
			},
			{
				id: 'request_url',
				type: 'text',
				label: translate('Request URL'),
				render: ({ item }: { item: ServerLog }) => {
					return <span className="site-logs-table__request-url">{item.request_url}</span>;
				},
				enableSorting: false,
			},
			{
				id: 'body_bytes_sent',
				type: 'integer',
				label: translate('Body bytes sent'),
				render: ({ item }: { item: ServerLog }) => numberFormat(item.body_bytes_sent),
				enableSorting: false,
			},
			{
				id: 'cached',
				type: 'text',
				label: translate('Cached'),
				enableSorting: false,
				elements: VALUES_CACHED.map((cached) => ({
					value: cached,
					label: getLabelCached(cached),
				})),
				filterBy: {
					operators: ['isAny' as Operator],
				},
			},
			{ id: 'http_host', type: 'text', label: translate('HTTP Host'), enableSorting: false },
			{
				id: 'http_referer',
				type: 'text',
				label: translate('HTTP Referrer'),
				render: ({ item }: { item: ServerLog }) => {
					return <span className="site-logs-table__http-referer">{item.http_referer}</span>;
				},
				enableSorting: false,
			},
			{
				id: 'http2',
				type: 'text',
				label: translate('HTTP2'),
				enableSorting: false,
			},
			{
				id: 'http_user_agent',
				type: 'text',
				label: translate('HTTP User Agent'),
				enableSorting: false,
			},
			{
				id: 'http_version',
				type: 'text',
				label: translate('HTTP Version'),
				enableSorting: false,
			},
			{
				id: 'http_x_forwarded_for',
				type: 'text',
				label: translate('HTTP X Forwarded Port'),
				enableSorting: false,
			},
			{
				id: 'renderer',
				type: 'text',
				label: translate('Renderer'),
				elements: VALUES_RENDERER.map((renderer) => ({
					value: renderer,
					label: getLabelRenderer(renderer),
				})),
				filterBy: {
					operators: ['isAny' as Operator],
				},
				enableSorting: false,
			},
			{
				id: 'request_completion',
				type: 'text',
				label: translate('Request Completion'),
				enableSorting: false,
			},
			{
				id: 'request_time',
				type: 'text',
				label: translate('Request Time'),
				enableSorting: false,
			},
			{
				id: 'scheme',
				type: 'text',
				label: translate('Scheme'),
				enableSorting: false,
			},
			{ id: 'timestamp', type: 'integer', label: translate('Timestamp'), enableSorting: false },
			{
				id: 'type',
				type: 'text',
				label: translate('Type'),
				enableSorting: false,
			},
			{
				id: 'user_ip',
				type: 'text',
				label: translate('User IP'),
				enableSorting: false,
			},
		] as Field<PHPLog | ServerLog>[];
	}, [getFormattedDate, logType, siteGsmOffsetDisplay, translate]);

	return fields;
};

export default useFields;
