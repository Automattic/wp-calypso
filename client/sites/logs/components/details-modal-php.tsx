import { Badge } from '@automattic/components';
import { useTranslate, numberFormat } from 'i18n-calypso';
import moment from 'moment';
import { PHPLog } from 'calypso/data/hosting/use-site-logs-query';
import { useSelector } from 'calypso/state';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import { useCurrentSiteGmtOffset } from '../hooks/use-current-site-gmt-offset';

interface DetailsModalPHPProps {
	item: PHPLog;
}

const DetailsModalPHP = ( { item }: DetailsModalPHPProps ) => {
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
					translate( 'DATE & TIME (%(siteGsmOffsetDisplay)s)', {
						args: { siteGsmOffsetDisplay },
					} )
				}
			</div>
			<div>{ getFormattedDate( item.timestamp ) }</div>
			<div className="site-logs-details-modal__field-title">{ translate( 'SEVERITY' ) }</div>
			<div>
				<Badge className={ `badge--${ item.severity }` }>{ item.severity }</Badge>
			</div>
			<div className="site-logs-details-modal__field-title">{ translate( 'MESSAGE' ) }</div>
			<div>{ item.message }</div>
			<div className="site-logs-details-modal__field-title">{ translate( 'KIND' ) }</div>
			<div>{ item.kind }</div>
			<div className="site-logs-details-modal__field-title">{ translate( 'NAME' ) }</div>
			<div>{ item.name }</div>
			<div className="site-logs-details-modal__field-title">{ translate( 'FILE' ) }</div>
			<div>{ item.file }</div>
			<div className="site-logs-details-modal__field-title">{ translate( 'LINE' ) }</div>
			<div>{ numberFormat( item.line ) }</div>
			<div className="site-logs-details-modal__field-title">{ translate( 'ATOMIC SITE ID' ) }</div>
			<div>{ item.atomic_site_id }</div>
		</div>
	);
};

export default DetailsModalPHP;
