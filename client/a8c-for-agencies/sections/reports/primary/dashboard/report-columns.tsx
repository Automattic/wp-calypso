import { type BadgeType, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import StatusBadge from 'calypso/a8c-for-agencies/components/step-section-item/status-badge';
import FormattedDate from 'calypso/components/formatted-date';
import { urlToSlug } from 'calypso/lib/url/http-utils';
import type { ReportStatus } from '../../types';

export const ReportSiteColumn = ( { site }: { site: string } ) => urlToSlug( site );

export const ReportCountColumn = ( { count }: { count: number } ) => {
	const translate = useTranslate();
	return (
		<span className="reports-list__count">
			{ translate( '%(count)d report', '%(count)d reports', {
				count,
				args: { count },
			} ) }
		</span>
	);
};

export const ReportStatusColumn = ( { status }: { status: ReportStatus } ) => {
	const translate = useTranslate();

	const statusConfig = {
		sent: { type: 'success', text: translate( 'Sent' ) },
		pending: { type: 'warning', text: translate( 'Pending' ) },
		processed: { type: 'warning', text: translate( 'Pending' ) },
		error: { type: 'error', text: translate( 'Error' ) },
	};

	const config = statusConfig[ status ];

	if ( ! config ) {
		return <Gridicon icon="minus" />;
	}

	return <StatusBadge statusProps={ { children: config.text, type: config.type as BadgeType } } />;
};

export const ReportDateColumn = ( { date }: { date: number | null } ) => {
	if ( ! date ) {
		return <Gridicon icon="minus" />;
	}

	const dateObj = new Date( date * 1000 );
	return <FormattedDate date={ dateObj } format="DD MMM YYYY HH:mm" />;
};
