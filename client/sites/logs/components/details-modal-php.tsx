import { Badge } from '@automattic/components';
import { formatNumber } from '@automattic/number-formatters';
import { useTranslate } from 'i18n-calypso';
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
					translate( 'Date & Time (%(siteGsmOffsetDisplay)s)', {
						args: { siteGsmOffsetDisplay },
					} )
				}
			</div>
			<div>{ getFormattedDate( item.timestamp ) }</div>
			<div className="site-logs-details-modal__field-title">{ translate( 'Group' ) }</div>
			<div>{ item.kind }</div>
			<div className="site-logs-details-modal__field-title">{ translate( 'Source' ) }</div>
			<div>{ item.name }</div>
			<div className="site-logs-details-modal__field-title">{ translate( 'Severity' ) }</div>
			<div>
				<Badge className={ `badge--${ item.severity }` }>{ item.severity }</Badge>
			</div>
			<div className="site-logs-details-modal__field-title">{ translate( 'File' ) }</div>
			<div>{ item.file }</div>
			<div className="site-logs-details-modal__field-title">{ translate( 'Line' ) }</div>
			<div>{ formatNumber( item.line ) }</div>
			<div className="site-logs-details-modal__field-title">{ translate( 'Message' ) }</div>
			<div>{ item.message }</div>
		</div>
	);
};

export default DetailsModalPHP;
