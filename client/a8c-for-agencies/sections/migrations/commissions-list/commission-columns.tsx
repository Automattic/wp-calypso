import { BadgeType } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import StatusBadge from 'calypso/a8c-for-agencies/components/step-section-item/status-badge';
import FormattedDate from 'calypso/components/formatted-date';
import { urlToSlug } from 'calypso/lib/url/http-utils';

const DETAILS_DATE_FORMAT_SHORT = 'DD MMM YYYY';

export const SiteColumn = ( { site }: { site: string } ) => {
	return urlToSlug( site );
};

export const MigratedOnColumn = ( { migratedOn }: { migratedOn: number } ) => {
	const date = new Date( migratedOn * 1000 );
	return <FormattedDate date={ date } format={ DETAILS_DATE_FORMAT_SHORT } />;
};

export const ReviewStatusColumn = ( {
	reviewStatus,
}: {
	reviewStatus: 'pending' | 'confirmed' | 'rejected' | 'paid';
} ) => {
	const translate = useTranslate();

	const getStatusProps = () => {
		switch ( reviewStatus ) {
			case 'paid':
				return {
					statusText: translate( 'Paid' ),
					statusType: 'success',
				};
			case 'confirmed':
				return {
					statusText: translate( 'Confirmed' ),
					statusType: 'success',
				};
			case 'rejected':
				return {
					statusText: translate( 'Rejected' ),
					statusType: 'error',
				};
			default:
				return {
					statusText: translate( 'Pending' ),
					statusType: 'warning',
				};
		}
	};

	const statusProps = getStatusProps();

	if ( ! statusProps ) {
		return null;
	}
	return (
		<StatusBadge
			statusProps={ {
				children: statusProps.statusText,
				type: statusProps.statusType as BadgeType,
			} }
		/>
	);
};
