import { __ } from '@wordpress/i18n';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';

export default function MarketplaceHosting() {
	return <PageLayout header={ <PageHeader title={ __( 'Hosting' ) } /> } />;
}
