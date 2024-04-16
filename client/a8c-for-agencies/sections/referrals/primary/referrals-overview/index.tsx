import { pages, plugins } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import Layout from 'calypso/a8c-for-agencies/components/layout';
import LayoutBody from 'calypso/a8c-for-agencies/components/layout/body';
import LayoutHeader, {
	LayoutHeaderTitle as Title,
} from 'calypso/a8c-for-agencies/components/layout/header';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/top';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import StepSection from '../../common/step-section';
import StepSectionItem from '../../common/step-section-item';

import './style.scss';

export default function ReferralsOverview() {
	const translate = useTranslate();

	const title = translate( 'Referrals' );

	return (
		<Layout title={ title } wide sidebarNavigation={ <MobileSidebarNavigation /> }>
			<PageViewTracker title="Referrals" path="/referrals" />

			<LayoutTop>
				<LayoutHeader>
					<Title>{ title } </Title>
				</LayoutHeader>
			</LayoutTop>

			<LayoutBody className="referrals-overview">
				<StepSection heading={ translate( 'Get set up' ) } stepCount={ 1 }>
					<StepSectionItem
						icon={ pages }
						heading={ translate( 'Add your bank details and upload tax forms' ) }
						description={ translate(
							'Once confirmed, we’ll be able to send you a commission payment at the end of each month.'
						) }
						buttonProps={ { children: translate( 'Add bank details' ), primary: true } }
					/>
					<StepSectionItem
						icon={ plugins }
						heading={ translate( 'Install the A4A plugin on your clients’ sites' ) }
						description={ translate(
							'Our plugin can confirm that your agency is connected to the Automattic products your clients buy.'
						) }
						buttonProps={ { children: translate( 'Download plugin' ) } }
					/>
				</StepSection>
			</LayoutBody>
		</Layout>
	);
}
