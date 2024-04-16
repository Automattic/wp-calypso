import { pages, plugins, payment, percent } from '@wordpress/icons';
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

			<LayoutBody>
				<div className="referrals-overview__section-heading">
					{ translate( 'Earn a 30% commission for every purchase made by a client' ) }
				</div>
				<div className="referrals-overview__section-container">
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
					<StepSection heading={ translate( 'Get paid' ) } stepCount={ 2 }>
						<StepSectionItem
							icon={ payment }
							heading={ translate( 'Have your client purchase Automattic Products' ) }
							description={ translate(
								'We offer commissions for each purchase of Automattic products by your clients, including Woo, Jetpack, and hosting from either Pressable or WordPress.com.'
							) }
						/>
						<StepSectionItem
							icon={ percent }
							heading={ translate( 'Get paid a commission on your referrals' ) }
							description={ translate(
								'At the end of each month, we will review your clients’ purchases and pay you a commission based on them.'
							) }
						/>
					</StepSection>
				</div>
			</LayoutBody>
		</Layout>
	);
}
