import { __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import AppsDesktopCard from './apps-desktop-card';
import AppsMobileCard from './apps-mobile-card';

export default function Apps() {
	return (
		<PageLayout size="small" header={ <PageHeader title={ __( 'Apps' ) } /> }>
			<VStack spacing={ 8 }>
				<AppsMobileCard />
				<AppsDesktopCard appSlug="wordpress" />
				<AppsDesktopCard appSlug="studio" />
			</VStack>
		</PageLayout>
	);
}
