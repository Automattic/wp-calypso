import { Badge } from '@automattic/components';
import { useTranslate, numberFormat } from 'i18n-calypso';
import moment from 'moment';
import { ServerLog } from 'calypso/data/hosting/use-site-logs-query';
import { useSelector } from 'calypso/state';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import { useCurrentSiteGmtOffset } from '../hooks/use-current-site-gmt-offset';

interface DetailsModalServerProps {
	item: ServerLog;
}

const DetailsModalServer = ( { item }: DetailsModalServerProps ) => {
	const translate = useTranslate();
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

	return (
		<div className="site-logs-details-modal">
			<div className="site-logs-details-modal__field-title">
				{
					// translators: %(siteGsmOffsetDisplay)s will be replaced with the timezone offset of the site, e.g. GMT, GMT +1, GMT -1.
					translate( 'Date & Time (%(siteGsmOffsetDisplay)s)', {
						args: { siteGsmOffsetDisplay },
					} )
				}
			</div>
			<div>{ getFormattedDate( item.date ) }</div>
			<div className="site-logs-details-modal__field-title">{ translate( 'Request Type' ) }</div>
			<div>
				<Badge className={ `badge--${ item.request_type }` }>{ item.request_type }</Badge>
			</div>
			<div className="site-logs-details-modal__field-title">{ translate( 'Status' ) }</div>
			<div>{ item.status }</div>
			<div className="site-logs-details-modal__field-title">{ translate( 'Request URL' ) }</div>
			<div>{ item.request_url }</div>
			<div className="site-logs-details-modal__field-title">{ translate( 'Body Bytes Sent' ) }</div>
			<div>{ numberFormat( item.body_bytes_sent ) }</div>
			<div className="site-logs-details-modal__field-title">{ translate( 'Cached' ) }</div>
			<div>{ item.cached }</div>
			<div className="site-logs-details-modal__field-title">{ translate( 'HTTP Host' ) }</div>
			<div>{ item.http_host }</div>
			<div className="site-logs-details-modal__field-title">{ translate( 'HTTP Referrer' ) }</div>
			<div>{ item.http_referer }</div>
			<div className="site-logs-details-modal__field-title">{ translate( 'HTTP/2' ) }</div>
			<div>{ item.http2 }</div>
			<div className="site-logs-details-modal__field-title">{ translate( 'User Agent' ) }</div>
			<div>{ item.http_user_agent }</div>
			<div className="site-logs-details-modal__field-title">{ translate( 'HTTP Version' ) }</div>
			<div>{ item.http_version }</div>
			<div className="site-logs-details-modal__field-title">{ translate( 'X-Forwarded-For' ) }</div>
			<div>{ item.http_x_forwarded_for }</div>
			<div className="site-logs-details-modal__field-title">{ translate( 'Renderer' ) }</div>
			<div>{ item.renderer }</div>
			<div className="site-logs-details-modal__field-title">
				{ translate( 'Request Completion' ) }
			</div>
			<div>{ item.request_completion }</div>
			<div className="site-logs-details-modal__field-title">{ translate( 'Request Time' ) }</div>
			<div>{ item.request_time }</div>
			<div className="site-logs-details-modal__field-title">{ translate( 'Scheme' ) }</div>
			<div>{ item.scheme }</div>
			<div className="site-logs-details-modal__field-title">{ translate( 'Timestamp' ) }</div>
			<div>{ item.timestamp }</div>
			<div className="site-logs-details-modal__field-title">{ translate( 'Type' ) }</div>
			<div>{ item.type }</div>
			<div className="site-logs-details-modal__field-title">{ translate( 'User IP' ) }</div>
			<div>{ item.user_ip }</div>
		</div>
	);
};

export default DetailsModalServer;
