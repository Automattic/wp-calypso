import { Badge } from '@automattic/components';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { translate } from 'i18n-calypso';
import moment from 'moment';
import { LogType, PHPLog, ServerLog } from 'calypso/data/hosting/use-site-logs-query';
import { useSelector } from 'calypso/state';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import { useCurrentSiteGmtOffset } from './use-current-site-gmt-offset';
import type { Field, Operator } from '@wordpress/dataviews';

const useFields = ( { logType }: { logType: LogType } ): Field< ServerLog | PHPLog >[] => {
	const { __ } = useI18n();
	const locale = useSelector( getCurrentUserLocale );
	const siteGmtOffset = useCurrentSiteGmtOffset();
	const siteGsmOffsetDisplay =
		siteGmtOffset === 0 ? 'UTC' : `UTC${ siteGmtOffset > 0 ? '+' : '' }${ siteGmtOffset }`;

	const getFormattedDate = ( value: string ) => {
		const dateFormat = locale === 'en' ? 'll [at] h:mm A' : 'h:mm A, ll';
		const formattedDate = moment( value )
			.utcOffset( siteGmtOffset * 60 )
			.format( dateFormat );
		return <span>{ formattedDate }</span>;
	};

	if ( logType === 'php' ) {
		return [
			{
				id: 'severity',
				type: 'text',
				label: __( 'Severity' ),
				elements: [
					{ value: '', label: translate( 'All' ) },
					{ value: 'User', label: translate( 'User' ) },
					{ value: 'Warning', label: translate( 'Warning' ) },
					{ value: 'Deprecated', label: translate( 'Deprecated' ) },
					{ value: 'Fatal error', label: translate( 'Fatal error' ) },
				],
				filterBy: {
					operators: [ 'is' as Operator ],
				},
				render: ( { item }: { item: PHPLog } ) => {
					const severity = item.severity;
					return <Badge className={ `badge--${ severity }` }>{ severity }</Badge>;
				},
				enableSorting: false,
			},
			{
				id: 'timestamp',
				type: 'date',
				// translators: %s is the timezone offset of the site, e.g. GMT, GMT +1, GMT -1.
				label: sprintf( __( 'Date & time (%s)' ), siteGsmOffsetDisplay ),
				render: ( { item }: { item: PHPLog } ) => getFormattedDate( item.timestamp ),
			},
			{
				id: 'message',
				type: 'text',
				label: __( 'Message' ),
				render: ( { item }: { item: PHPLog } ) => {
					return <span className="site-logs-table__message">{ item.message }</span>;
				},
				enableSorting: false,
			},
			{ id: 'kind', type: 'text', label: __( 'Kind' ), enableSorting: false },
			{ id: 'name', type: 'text', label: __( 'Name' ), enableSorting: false },
			{
				id: 'file',
				type: 'text',
				label: __( 'File' ),
				render: ( { item }: { item: PHPLog } ) => {
					return <span className="site-logs-table__file">{ item.file }</span>;
				},
				enableSorting: false,
			},
			{ id: 'line', type: 'integer', label: __( 'Line' ), enableSorting: false },
		] as Field< PHPLog | ServerLog >[];
	}

	return [
		{
			id: 'request_type',
			type: 'text',
			label: __( 'Request type' ),
			elements: [
				{ value: '', label: translate( 'All' ) },
				{ value: 'GET', label: translate( 'GET' ) },
				{ value: 'HEAD', label: translate( 'HEAD' ) },
				{ value: 'POST', label: translate( 'POST' ) },
				{ value: 'PUT', label: translate( 'PUT' ) },
				{ value: 'DELETE', label: translate( 'DELETE' ) },
			],
			filterBy: { operators: [ 'is' as Operator ] },
			render: ( { item }: { item: ServerLog } ) => {
				const requestType = item.request_type;
				return <Badge className={ `badge--${ requestType }` }>{ requestType }</Badge>;
			},
			enableSorting: false,
		},
		{
			id: 'date',
			type: 'datetime',
			// translators: %s is the timezone offset of the site, e.g. GMT, GMT +1, GMT -1.
			label: sprintf( __( 'Date & time (%s)' ), siteGsmOffsetDisplay ),
		},
		{
			id: 'status',
			type: 'text',
			label: __( 'Status' ),
			elements: [
				{ value: '', label: translate( 'All' ) },
				{ value: '200', label: '200' },
				{ value: '301', label: '301' },
				{ value: '302', label: '302' },
				{ value: '400', label: '400' },
				{ value: '401', label: '401' },
				{ value: '403', label: '403' },
				{ value: '404', label: '404' },
				{ value: '429', label: '429' },
				{ value: '500', label: '500' },
			],
			filterBy: {
				operators: [ 'is' as Operator ],
			},
			enableSorting: false,
		},
		{
			id: 'request_url',
			type: 'text',
			label: __( 'Request URL' ),
			render: ( { item }: { item: ServerLog } ) => {
				return <span className="site-logs-table__request-url">{ item.request_url }</span>;
			},
			enableSorting: false,
		},
		{ id: 'timestamp', type: 'integer', label: __( 'Timestamp' ), enableSorting: false },
		{
			id: 'body_bytes_sent',
			type: 'integer',
			label: __( 'Body bytes sent' ),
			enableSorting: false,
		},
		{ id: 'cached', type: 'text', label: __( 'Cached' ), enableSorting: false },
		{ id: 'http_host', type: 'text', label: __( 'HTTP Host' ), enableSorting: false },
		{
			id: 'http_referer',
			type: 'text',
			label: __( 'Referrer' ),
			render: ( { item }: { item: ServerLog } ) => {
				return <span className="site-logs-table__http-referer">{ item.request_url }</span>;
			},
			enableSorting: false,
		},
	] as Field< PHPLog | ServerLog >[];
};

export default useFields;
