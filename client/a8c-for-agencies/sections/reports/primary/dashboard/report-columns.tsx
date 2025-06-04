import { type BadgeType, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import StatusBadge from 'calypso/a8c-for-agencies/components/step-section-item/status-badge';
import FormattedDate from 'calypso/components/formatted-date';
import { urlToSlug } from 'calypso/lib/url/http-utils';

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

export const ReportStatusColumn = ( { status }: { status: 'sent' | 'error' } ) => {
	const translate = useTranslate();

	const statusConfig = {
		sent: { type: 'success', text: translate( 'Sent' ) },
		error: { type: 'error', text: translate( 'Error' ) },
	};

	const config = statusConfig[ status ];

	if ( ! config ) {
		return <Gridicon icon="minus" />;
	}

	return <StatusBadge statusProps={ { children: config.text, type: config.type as BadgeType } } />;
};

export const ReportDateColumn = ( { date }: { date: string | null } ) => {
	if ( ! date ) {
		return <Gridicon icon="minus" />;
	}

	return <FormattedDate date={ date } format="DD MMM YYYY" />;
};
