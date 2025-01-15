import {
	__experimentalHeading as Heading,
	__experimentalText as Text,
} from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
// import A4AAgencyApprovalNotice from 'calypso/a8c-for-agencies/components/a4a-agency-approval-notice';
// import ContentSidebar from 'calypso/a8c-for-agencies/components/content-sidebar';
import { LayoutWithGuidedTour as Layout } from 'calypso/a8c-for-agencies/components/layout/layout-with-guided-tour';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/layout-with-payment-notification';
// import PressableUsageLimitNotice from 'calypso/a8c-for-agencies/components/pressable-usage-limit-notice';
// import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import LayoutBody from 'calypso/layout/hosting-dashboard/body';
import LayoutHeader, {
	// LayoutHeaderActions as Actions,
	LayoutHeaderTitle as Title,
} from 'calypso/layout/hosting-dashboard/header';
// import OverviewBody from './body';
// import OverviewHeaderActions from './header-actions';
import PartnerDirectoryOnboardingCard from './partner-directory-onboarding-card';
// import OverviewSidebar from './sidebar';

import './style.scss';

export default function Overview() {
	const translate = useTranslate();
	const title = translate( 'Typography' );

	return (
		<Layout title={ title } wide>
			<LayoutTop>
				{ /* <A4AAgencyApprovalNotice />
				<PressableUsageLimitNotice /> */ }
				<LayoutHeader className="a4a-overview-header">
					<Title>{ title }</Title>
					{ /* <Actions className="a4a-overview__header-actions">
						<MobileSidebarNavigation />
						<OverviewHeaderActions />
					</Actions> */ }
				</LayoutHeader>
			</LayoutTop>
			<LayoutBody className="a4a-overview-content">
				<table className="a4a-table">
					<thead>
						<tr>
							<th>Details</th>
							<th>Implementation</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>
								Using the level 1{ ' ' }
								<a
									target="_blank"
									rel="noreferrer"
									href="https://wordpress.github.io/gutenberg/?path=/docs/components-experimental-heading--docs"
								>
									Heading
								</a>{ ' ' }
								component with font-weight 500 & line-height 1.25
							</td>
							<td>
								<Heading weight={ 500 } level={ 1 } lineHeight={ 1.25 }>
									Welcome to Automattic
								</Heading>
							</td>
						</tr>
						<tr>
							<td>Using the "heading-2x-large mixin"</td>
							<td>
								<h1 className="heading-2x-large">Welcome to Automattic</h1>
							</td>
						</tr>
						<tr>
							<td>
								Using the "heading-2x-large mixin" with rem function for font-size and line-height
							</td>
							<td>
								<h1 className="heading-2x-large-rem">Welcome to Automattic</h1>
							</td>
						</tr>
						<tr>
							<td>
								Using the{ ' ' }
								<a
									target="_blank"
									rel="noreferrer"
									href="https://wordpress.github.io/gutenberg/?path=/docs/components-experimental-text--docs"
								>
									Text
								</a>{ ' ' }
								component with font-weight 400
							</td>
							<td>
								<Text color="unset" weight={ 400 }>
									We are the people behind WordPress.com, Woo, Jetpack, WordPress VIP, Simplenote,
									Longreads, The Atavist, WPScan, Akismet, Gravatar, Crowdsignal, Cloudup, Tumblr,
									Day One, Pocket Casts, Newspack, Beeper, and more. We believe in making the web a
									better place.
								</Text>
							</td>
						</tr>
						<tr>
							<td>Using the "body-medium mixin"</td>
							<td>
								<div className="body-medium">
									We are the people behind WordPress.com, Woo, Jetpack, WordPress VIP, Simplenote,
									Longreads, The Atavist, WPScan, Akismet, Gravatar, Crowdsignal, Cloudup, Tumblr,
									Day One, Pocket Casts, Newspack, Beeper, and more. We believe in making the web a
									better place.
								</div>
							</td>
						</tr>
						<tr>
							<td>Using the "body-medium mixin" with rem function for font-size and line-height</td>
							<td>
								<div className="body-medium-rem">
									We are the people behind WordPress.com, Woo, Jetpack, WordPress VIP, Simplenote,
									Longreads, The Atavist, WPScan, Akismet, Gravatar, Crowdsignal, Cloudup, Tumblr,
									Day One, Pocket Casts, Newspack, Beeper, and more. We believe in making the web a
									better place.
								</div>
							</td>
						</tr>
						<tr>
							<td>
								Using the "body-medium-unitless mixin" with unitless value(1.5385) for line-height
							</td>
							<td>
								<div className="body-medium-unitless">
									We are the people behind WordPress.com, Woo, Jetpack, WordPress VIP, Simplenote,
									Longreads, The Atavist, WPScan, Akismet, Gravatar, Crowdsignal, Cloudup, Tumblr,
									Day One, Pocket Casts, Newspack, Beeper, and more. We believe in making the web a
									better place.
								</div>
							</td>
						</tr>
						<tr>
							<td>
								Using the "body-medium-unitless-rounded mixin" with unitless value(rounded: 1.54)
								for line-height
							</td>
							<td>
								<div className="body-medium-unitless-rounded">
									We are the people behind WordPress.com, Woo, Jetpack, WordPress VIP, Simplenote,
									Longreads, The Atavist, WPScan, Akismet, Gravatar, Crowdsignal, Cloudup, Tumblr,
									Day One, Pocket Casts, Newspack, Beeper, and more. We believe in making the web a
									better place.
								</div>
							</td>
						</tr>
					</tbody>
				</table>
			</LayoutBody>

			<PartnerDirectoryOnboardingCard />
		</Layout>
	);
}
