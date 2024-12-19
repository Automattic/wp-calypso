import { Button, Icon } from '@wordpress/components';
import { scheduled } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import moment from 'moment';
import './style.scss';

const REFRESH_REPORT_INTERVAL = 24; // 24 hours

type ExpiredReportNoticeProps = {
	onRetest: () => void;
	reportTimestamp?: string;
};

export const ExpiredReportNotice = ( { onRetest, reportTimestamp }: ExpiredReportNoticeProps ) => {
	const translate = useTranslate();
	const isOlderThan24Hours = reportTimestamp
		? moment().diff( moment( reportTimestamp ), 'hours' ) > REFRESH_REPORT_INTERVAL
		: false;

	if ( ! isOlderThan24Hours ) {
		return null;
	}
	return (
		<div className="expired-report-notice">
			<Icon className="icon" icon={ scheduled } size={ 24 } />
			<div className="expired-report-notice-content">
				<div className="expired-report-text">
					<span className="text">{ translate( 'These results are more than 24 hours old' ) }</span>
					<span className="subtext">
						{ translate( 'Test the page again if you have recently made updates to your site.' ) }
					</span>
				</div>
				<Button variant="primary" onClick={ onRetest }>
					{ translate( 'Test again' ) }
				</Button>
			</div>
		</div>
	);
};
