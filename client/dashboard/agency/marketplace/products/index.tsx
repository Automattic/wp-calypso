import { __ } from '@wordpress/i18n';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';

export default function MarketplaceProducts() {
	return <PageLayout header={ <PageHeader title={ __( 'Products' ) } /> } />;
}
