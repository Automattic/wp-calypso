import { __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { SitesList } from './sites-list';

export default function NotificationsSites() {
	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					title={ __( 'Sites' ) }
					description={ __(
						'Set your notification preferences for different site activities, such as new comments, mentions or followers. Choose to be notified by email, in-product, or both.'
					) }
				/>
			}
		>
			<VStack spacing={ 4 }>
				<SitesList />
			</VStack>
		</PageLayout>
	);
}
