import { Badge } from '@automattic/components';
import { copy } from '@wordpress/icons';
import { useTranslate, numberFormat } from 'i18n-calypso';
import moment from 'moment';
import { useMemo } from 'react';
import { LogType, ServerLog, PHPLog } from 'calypso/data/hosting/use-site-logs-query';
import { useDispatch, useSelector } from 'calypso/state';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import { successNotice, errorNotice } from 'calypso/state/notices/actions';
import { useCurrentSiteGmtOffset } from './use-current-site-gmt-offset';

const useActions = ( { logType, isLoading }: { logType: LogType; isLoading: boolean } ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const siteGmtOffset = useCurrentSiteGmtOffset();
	const siteGsmOffsetDisplay =
		siteGmtOffset === 0 ? 'UTC' : `UTC${ siteGmtOffset > 0 ? '+' : '' }${ siteGmtOffset }`;
	const locale = useSelector( getCurrentUserLocale );
	const getFormattedDate = useMemo(
		() => ( value: string ) => {
			const dateFormat = locale === 'en' ? 'll [at] h:mm A' : 'h:mm A, ll';
			const formattedDate = moment( value )
				.utcOffset( siteGmtOffset * 60 )
				.format( dateFormat );
			return <span>{ formattedDate }</span>;
		},
		[ locale, siteGmtOffset ]
	);

	const actions = useMemo( () => {
		if ( logType === 'php' ) {
			return [
				{
					id: 'copy-msg',
					label: translate( 'Copy message' ),
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
									translate( 'Copied' )
								)
							);
						} catch ( error ) {
							dispatch(
								errorNotice(
									/* translators: notice shown upon failed copy of Logs entry */
									translate( 'Copy failed' )
								)
							);
						}
					},
				},
				{
					id: 'details-modal',
					label: translate( 'View log details' ),
					modalHeader: translate( 'Log details' ),
					isPrimary: false,
					disabled: isLoading,
					supportsBulk: false,
					RenderModal: ( { items }: { items: ( PHPLog | ServerLog )[] } ) => {
						const item = items[ 0 ] as PHPLog;
						return (
							<div className="site-logs-details-modal">
								<div className="site-logs-details-modal__field-title">
									{
										// translators: %(siteGsmOffsetDisplay)s will be replaced with the timezone offset of the site, e.g. GMT, GMT +1, GMT -1.
										translate( 'DATE & TIME (%(siteGsmOffsetDisplay)s)', {
											args: { siteGsmOffsetDisplay },
										} )
									}
								</div>
								<div>{ getFormattedDate( item.timestamp ) }</div>
								<div className="site-logs-details-modal__field-title">
									{ translate( 'SEVERITY' ) }
								</div>
								<div>
									<Badge className={ `badge--${ item.severity }` }>{ item.severity }</Badge>
								</div>
								<div className="site-logs-details-modal__field-title">
									{ translate( 'MESSAGE' ) }
								</div>
								<div>{ item.message }</div>
								<div className="site-logs-details-modal__field-title">{ translate( 'KIND' ) }</div>
								<div>{ item.kind }</div>
								<div className="site-logs-details-modal__field-title">{ translate( 'NAME' ) }</div>
								<div>{ item.name }</div>
								<div className="site-logs-details-modal__field-title">{ translate( 'FILE' ) }</div>
								<div>{ item.file }</div>
								<div className="site-logs-details-modal__field-title">{ translate( 'LINE' ) }</div>
								<div>{ numberFormat( item.line ) }</div>
								<div className="site-logs-details-modal__field-title">
									{ translate( 'ATOMIC SITE ID' ) }
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
				label: translate( 'Copy request URL' ),
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
				label: translate( 'View log details' ),
				modalHeader: translate( 'Log details' ),
				isPrimary: false,
				disabled: isLoading,
				supportsBulk: false,
				RenderModal: ( { items }: { items: ( PHPLog | ServerLog )[] } ) => {
					const item = items[ 0 ] as ServerLog;
					return (
						<div className="site-logs-details-modal">
							<div className="site-logs-details-modal__field-title">
								{
									// translators: %(siteGsmOffsetDisplay)s will be replaced with the timezone offset of the site, e.g. GMT, GMT +1, GMT -1.
									translate( 'DATE & TIME (%(siteGsmOffsetDisplay)s)', {
										args: { siteGsmOffsetDisplay },
									} )
								}
							</div>
							<div>{ getFormattedDate( item.date ) }</div>
							<div className="site-logs-details-modal__field-title">
								{ translate( 'REQUEST TYPE' ) }
							</div>
							<div>
								<Badge className={ `badge--${ item.request_type }` }>{ item.request_type }</Badge>
							</div>
							<div className="site-logs-details-modal__field-title">
								{ translate( 'HTTP STATUS' ) }
							</div>
							<div>{ item.status }</div>
							<div className="site-logs-details-modal__field-title">
								{ translate( 'REQUEST URL' ) }
							</div>
							<div>{ item.request_url }</div>
							<div className="site-logs-details-modal__field-title">
								{ translate( 'BODY BYTES SENT' ) }
							</div>
							<div>{ numberFormat( item.body_bytes_sent ) }</div>
							<div className="site-logs-details-modal__field-title">{ translate( 'CACHED' ) }</div>
							<div>{ item.cached }</div>
							<div className="site-logs-details-modal__field-title">
								{ translate( 'HTTP HOST' ) }
							</div>
							<div>{ item.http_host }</div>
							<div className="site-logs-details-modal__field-title">
								{ translate( 'HTTP REFERRER' ) }
							</div>
							<div>{ item.http_referer }</div>
							<div className="site-logs-details-modal__field-title">{ translate( 'HTTP/2' ) }</div>
							<div>{ item.http2 }</div>
							<div className="site-logs-details-modal__field-title">
								{ translate( 'User AGENT' ) }
							</div>
							<div>{ item.http_user_agent }</div>
							<div className="site-logs-details-modal__field-title">
								{ translate( 'HTTP VERSION' ) }
							</div>
							<div>{ item.http_version }</div>
							<div className="site-logs-details-modal__field-title">
								{ translate( 'X-FORWARDED-FOR' ) }
							</div>
							<div>{ item.http_x_forwarded_for }</div>
							<div className="site-logs-details-modal__field-title">
								{ translate( 'RENDERER' ) }
							</div>
							<div>{ item.renderer }</div>
							<div className="site-logs-details-modal__field-title">
								{ translate( 'REQUEST COMPLETION' ) }
							</div>
							<div>{ item.request_completion }</div>
							<div className="site-logs-details-modal__field-title">
								{ translate( 'REQUEST TIME' ) }
							</div>
							<div>{ item.request_time }</div>
							<div className="site-logs-details-modal__field-title">{ translate( 'SCHEME' ) }</div>
							<div>{ item.scheme }</div>
							<div className="site-logs-details-modal__field-title">
								{ translate( 'TIMESTAMP' ) }
							</div>
							<div>{ item.timestamp }</div>
							<div className="site-logs-details-modal__field-title">{ translate( 'TYPE' ) }</div>
							<div>{ item.type }</div>
							<div className="site-logs-details-modal__field-title">{ translate( 'USER IP' ) }</div>
							<div>{ item.user_ip }</div>
						</div>
					);
				},
			},
		];
	}, [ logType, translate, getFormattedDate, isLoading, dispatch, siteGsmOffsetDisplay ] );

	return actions;
};

export default useActions;
