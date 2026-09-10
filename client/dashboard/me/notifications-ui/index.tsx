import { __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import Breadcrumbs from '../../app/breadcrumbs';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { PanelCard } from './panel-card';
import { ViewsCard } from './views-card';

export default function NotificationsUserInterface() {
	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					prefix={ <Breadcrumbs length={ 2 } /> }
					title={ __( 'User interface' ) }
					description={ __( 'Choose how your notifications are presented.' ) }
				/>
			}
		>
			<VStack spacing={ 8 }>
				<PanelCard />
				<ViewsCard />
			</VStack>
		</PageLayout>
	);
}
