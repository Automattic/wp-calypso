import { Badge } from '@automattic/components';
import { sprintf } from '@wordpress/i18n';
import { copy } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import moment from 'moment';
import { useMemo } from 'react';
import { LogType, ServerLog, PHPLog } from 'calypso/data/hosting/use-site-logs-query';
import { useDispatch, useSelector } from 'calypso/state';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import { successNotice, errorNotice } from 'calypso/state/notices/actions';
import { useCurrentSiteGmtOffset } from './use-current-site-gmt-offset';

const useActions = ( { logType, isLoading }: { logType: LogType; isLoading: boolean } ) => {
	const { __ } = useI18n();
	const dispatch = useDispatch();
	const siteGmtOffset = useCurrentSiteGmtOffset();
	const siteGsmOffsetDisplay =
		siteGmtOffset === 0 ? 'UTC' : `UTC${ siteGmtOffset > 0 ? '+' : '' }${ siteGmtOffset }`;
	const locale = useSelector( getCurrentUserLocale );
	const getFormattedDate = ( value: string ) => {
		const dateFormat = locale === 'en' ? 'll [at] h:mm A' : 'h:mm A, ll';
		const formattedDate = moment( value )
			.utcOffset( siteGmtOffset * 60 )
			.format( dateFormat );
		return <span>{ formattedDate }</span>;
	};

	const actions = useMemo( () => {
		if ( logType === 'php' ) {
			return [
				{
					id: 'copy-msg',
					label: __( 'Copy message' ),
					icon: copy,
					isPrimary: true,
					disabled: isLoading,
					supportsBulk: false,
					callback: async ( items: ( PHPLog | ServerLog )[] ) => {
						const message = ( items[ 0 ] as PHPLog ).message;
						try {
							await navigator.clipboard.writeText( message );
							dispatch(
								successNotice(
									/* translators: notice shown upon copy of Logs entry */
									__( 'Copied' )
								)
							);
						} catch ( error ) {
							dispatch(
								errorNotice(
									/* translators: notice shown upon failed copy of Logs entry */
									__( 'Copy failed' )
								)
							);
						}
					},
				},
				{
					id: 'details-modal',
					label: __( 'View log details' ),
					modalHeader: __( 'Log Details' ),
					isPrimary: false,
					disabled: isLoading,
					supportsBulk: false,
					RenderModal: ( { items }: { items: PHPLog[] } ) => {
						const item = items[ 0 ] as PHPLog;
						return (
							<div className="site-logs-details-modal">
								<div className="site-logs-details-modal__field-title">
									{
										// translators: %s is the timezone offset of the site, e.g. GMT, GMT +1, GMT -1.
										sprintf( __( 'Date & time (%s):' ), siteGsmOffsetDisplay )
									}
								</div>
								<div>{ getFormattedDate( item.timestamp ) }</div>
								<div className="site-logs-details-modal__field-title">{ __( 'Severity:' ) }</div>
								<div>
									<Badge className={ `badge--${ item.severity }` }>{ item.severity }</Badge>
								</div>
								<div className="site-logs-details-modal__field-title">{ __( 'Message:' ) }</div>
								<div>{ item.message }</div>
								<div className="site-logs-details-modal__field-title">{ __( 'Kind:' ) }</div>
								<div>{ item.kind }</div>
								<div className="site-logs-details-modal__field-title">{ __( 'Name:' ) }</div>
								<div>{ item.name }</div>
								<div className="site-logs-details-modal__field-title">{ __( 'File:' ) }</div>
								<div>{ item.file }</div>
								<div className="site-logs-details-modal__field-title">{ __( 'Line:' ) }</div>
								<div>{ item.line }</div>
								<div className="site-logs-details-modal__field-title">
									{ __( 'Atomic Site ID:' ) }
								</div>
								<div>{ item.atomic_site_id }</div>
							</div>
						);
					},
				},
			];
		}

		return [
			{
				id: 'copy-url',
				label: __( 'Copy request URL' ),
				icon: copy,
				isPrimary: true,
				disabled: isLoading,
				supportsBulk: false,
				callback: ( items: ( PHPLog | ServerLog )[] ) => {
					const url = ( items[ 0 ] as ServerLog ).request_url;
					navigator.clipboard.writeText( url );
				},
			},
			{
				id: 'details-modal',
				label: __( 'View log details' ),
				modalHeader: __( 'Log Details' ),
				isPrimary: false,
				disabled: isLoading,
				supportsBulk: false,
				RenderModal: ( { items }: { items: ServerLog[] } ) => {
					const item = items[ 0 ] as ServerLog;
					return (
						<div className="site-logs-details-modal">
							<div className="site-logs-details-modal__field-title">
								{
									// translators: %s is the timezone offset of the site, e.g. GMT, GMT +1, GMT -1.
									sprintf( __( 'Date & time (%s):' ), siteGsmOffsetDisplay )
								}
							</div>
							<div>{ getFormattedDate( item.date ) }</div>
							<div className="site-logs-details-modal__field-title">{ __( 'Request type:' ) }</div>
							<div>
								<Badge className={ `badge--${ item.request_type }` }>{ item.request_type }</Badge>
							</div>
							<div className="site-logs-details-modal__field-title">{ __( 'HTTP Status:' ) }</div>
							<div>{ item.status }</div>
							<div className="site-logs-details-modal__field-title">{ __( 'Request URL:' ) }</div>
							<div>{ item.request_url }</div>
							<div className="site-logs-details-modal__field-title">
								{ __( 'Body bytes sent:' ) }
							</div>
							<div>{ item.body_bytes_sent }</div>
							<div className="site-logs-details-modal__field-title">{ __( 'Cached:' ) }</div>
							<div>{ item.cached }</div>
							<div className="site-logs-details-modal__field-title">{ __( 'HTTP Host:' ) }</div>
							<div>{ item.http_host }</div>
							<div className="site-logs-details-modal__field-title">{ __( 'HTTP Referrer:' ) }</div>
							<div>{ item.http_referer }</div>
							<div className="site-logs-details-modal__field-title">{ __( 'HTTP/2:' ) }</div>
							<div>{ item.http2 }</div>
							<div className="site-logs-details-modal__field-title">{ __( 'User Agent:' ) }</div>
							<div>{ item.http_user_agent }</div>
							<div className="site-logs-details-modal__field-title">{ __( 'HTTP Version:' ) }</div>
							<div>{ item.http_version }</div>
							<div className="site-logs-details-modal__field-title">
								{ __( 'X-Forwarded-For:' ) }
							</div>
							<div>{ item.http_x_forwarded_for }</div>
							<div className="site-logs-details-modal__field-title">{ __( 'Renderer:' ) }</div>
							<div>{ item.renderer }</div>
							<div className="site-logs-details-modal__field-title">
								{ __( 'Request Completion:' ) }
							</div>
							<div>{ item.request_completion }</div>
							<div className="site-logs-details-modal__field-title">{ __( 'Request Time:' ) }</div>
							<div>{ item.request_time }</div>
							<div className="site-logs-details-modal__field-title">{ __( 'Scheme:' ) }</div>
							<div>{ item.scheme }</div>
							<div className="site-logs-details-modal__field-title">{ __( 'Timestamp:' ) }</div>
							<div>{ item.timestamp }</div>
							<div className="site-logs-details-modal__field-title">{ __( 'Type:' ) }</div>
							<div>{ item.type }</div>
							<div className="site-logs-details-modal__field-title">{ __( 'User IP:' ) }</div>
							<div>{ item.user_ip }</div>
						</div>
					);
				},
			},
		];
	}, [ logType, __, isLoading, dispatch, siteGsmOffsetDisplay ] );

	return actions;
};

export default useActions;
