import { BadgeType } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import StatusBadge from 'calypso/a8c-for-agencies/components/step-section-item/status-badge';
import FormattedDate from 'calypso/components/formatted-date';

const DETAILS_DATE_FORMAT_SHORT = 'DD MMM YYYY';

export const SiteColumn = ( { site }: { site: string } ) => {
	return site;
};

export const MigratedOnColumn = ( { migratedOn }: { migratedOn: Date } ) => {
	return <FormattedDate date={ migratedOn } format={ DETAILS_DATE_FORMAT_SHORT } />;
};

export const ReviewStatusColumn = ( {
	reviewStatus,
}: {
	reviewStatus: 'confirmed' | 'pending' | 'rejected';
} ) => {
	const translate = useTranslate();

	const getStatusProps = () => {
		switch ( reviewStatus ) {
			case 'confirmed':
				return {
					statusText: translate( 'Confirmed' ),
					statusType: 'success',
				};
			case 'pending':
				return {
					statusText: translate( 'Pending' ),
					statusType: 'warning',
				};
			case 'rejected':
				return {
					statusText: translate( 'Rejected' ),
					statusType: 'error',
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
