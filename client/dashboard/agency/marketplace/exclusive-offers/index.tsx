import { __ } from '@wordpress/i18n';
import { useAnalytics } from '../../../app/analytics';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import PartnerOffers from './partner-offers';

export default function ExclusiveOffers() {
	const { recordTracksEvent } = useAnalytics();

	return (
		<PageLayout header={ <PageHeader title={ __( 'Exclusive offers' ) } /> }>
			<PartnerOffers recordTracksEvent={ recordTracksEvent } />
		</PageLayout>
	);
}
