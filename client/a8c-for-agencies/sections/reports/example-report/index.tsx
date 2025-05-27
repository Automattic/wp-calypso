import { useTranslate } from 'i18n-calypso';
import { ReactNode } from 'react';
import { LayoutWithGuidedTour as Layout } from 'calypso/a8c-for-agencies/components/layout/layout-with-guided-tour';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/layout-with-payment-notification';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import { A4A_REPORTS_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import LayoutBody from 'calypso/layout/hosting-dashboard/body';
import LayoutHeader, {
	LayoutHeaderBreadcrumb as Breadcrumb,
	LayoutHeaderActions as Actions,
} from 'calypso/layout/hosting-dashboard/header';

import './style.scss';

interface ReportCardProps {
	title: string;
	value?: string | number;
	children?: ReactNode;
	className?: string;
}

const ReportCard = ( { title, value, children, className }: ReportCardProps ) => (
	<div className={ `example-report__card ${ className || '' }` }>
		<h3 className="example-report__card-title">{ title }</h3>
		{ value && <p className="example-report__card-value">{ value }</p> }
		{ children }
	</div>
);

const ExampleReport = () => {
	const translate = useTranslate();
	const title = translate( 'Site Report' );

	// Mock data
	const reportData = {
		siteName: 'Lauger Watch Co.',
		siteUrl: 'laugerwatch.com',
		dateRange: 'MAY 26 - JUNE 26, 2025',
		stats: {
			visitors: 580,
			views: 3200,
			topPosts: [
				{ name: 'Book a showing', views: 1357 },
				{ name: 'Repair services', views: 26 },
				{ name: 'Bundled packages', views: 24 },
				{ name: 'Membership plans', views: 19 },
				{ name: 'Gallery', views: 14 },
			],
			topReferrers: [
				{ name: 'Search engines', views: 1357 },
				{ name: 'Reddit', views: 26 },
				{ name: 'X', views: 24 },
				{ name: 'WordPress Android App', views: 19 },
				{ name: 'WordPress iOS App', views: 14 },
			],
			topCities: [
				{ name: 'Boston', views: 423 },
				{ name: 'Dallas', views: 213 },
				{ name: 'San Francisco', views: 53 },
				{ name: 'Los Angeles', views: 12 },
				{ name: 'New York City', views: 5 },
			],
			deviceBreakdown: [
				{ device: 'Mobile', percentage: 58 },
				{ device: 'Desktop', percentage: 40 },
				{ device: 'Tablet', percentage: 2 },
			],
			popularTime: '3:00 PM',
			popularDay: 'Friday',
		},
	};

	return (
		<Layout
			className="example-report"
			title={ title }
			wide
			sidebarNavigation={ <MobileSidebarNavigation /> }
		>
			<LayoutTop>
				<LayoutHeader>
					<Breadcrumb
						hideOnMobile
						items={ [
							{
								label: translate( 'Client Reports' ),
								href: A4A_REPORTS_LINK,
							},
							{
								label: translate( 'Example report' ),
							},
						] }
					/>
					<Actions>
						<MobileSidebarNavigation />
					</Actions>
				</LayoutHeader>
			</LayoutTop>
			<LayoutBody className="example-report__body">
				<div className="example-report__content">
					<div className="example-report__header">
						<div className="example-report__header-content">
							<p className="example-report__date">{ translate( 'SITE UPDATE' ) }</p>
							<p className="example-report__date">{ reportData.dateRange }</p>
							<h1>{ reportData.siteName }</h1>
							<p className="example-report__url">{ reportData.siteUrl }</p>
							<p className="example-report__message">
								{ translate(
									"Hey Mary! Here's your monthly report for your site! Let us know if you have any questions."
								) }
							</p>
						</div>
					</div>

					<div className="example-report__inner-body">
						<div className="example-report__section-title-container">
							<h2 className="example-report__section-title">{ translate( 'Last 30 days' ) }</h2>
						</div>

						<div className="example-report__grid">
							<ReportCard title={ translate( 'Visitors' ) } value={ reportData.stats.visitors } />
							<ReportCard title={ translate( 'Views' ) } value={ reportData.stats.views } />
							<ReportCard
								title={ translate( 'Top 5 posts' ) }
								className="example-report__card--list"
							>
								<div className="example-report__table-header">
									<span className="example-report__table-header-text">{ translate( 'Name' ) }</span>
									<span className="example-report__table-header-text">
										{ translate( 'Views' ) }
									</span>
								</div>
								{ reportData.stats.topPosts.map( ( post ) => (
									<div key={ post.name } className="example-report__table-row">
										<span>{ post.name }</span>
										<span>{ post.views }</span>
									</div>
								) ) }
							</ReportCard>
							<ReportCard
								title={ translate( 'Top 5 referrers' ) }
								className="example-report__card--list"
							>
								<div className="example-report__table-header">
									<span className="example-report__table-header-text">{ translate( 'Name' ) }</span>
									<span className="example-report__table-header-text">
										{ translate( 'Views' ) }
									</span>
								</div>
								{ reportData.stats.topReferrers.map( ( referrer ) => (
									<div key={ referrer.name } className="example-report__table-row">
										<span>{ referrer.name }</span>
										<span>{ referrer.views }</span>
									</div>
								) ) }
							</ReportCard>
							<ReportCard
								title={ translate( 'Top 5 cities' ) }
								className="example-report__card--list"
							>
								<div className="example-report__table-header">
									<span className="example-report__table-header-text">{ translate( 'Name' ) }</span>
									<span className="example-report__table-header-text">
										{ translate( 'Views' ) }
									</span>
								</div>
								{ reportData.stats.topCities.map( ( city ) => (
									<div key={ city.name } className="example-report__table-row">
										<span>{ city.name }</span>
										<span>{ city.views }</span>
									</div>
								) ) }
							</ReportCard>
							<ReportCard
								title={ translate( 'Device breakdown' ) }
								className="example-report__card--list"
							>
								<div className="example-report__table-header">
									<span className="example-report__table-header-text">
										{ translate( 'Device' ) }
									</span>
									<span className="example-report__table-header-text">{ translate( '%' ) }</span>
								</div>
								{ reportData.stats.deviceBreakdown.map( ( item ) => (
									<div key={ item.device } className="example-report__table-row">
										<span>{ item.device }</span>
										<span>{ item.percentage }</span>
									</div>
								) ) }
							</ReportCard>
						</div>

						<div className="example-report__section-title-container">
							<h2 className="example-report__section-title">{ translate( 'Total' ) }</h2>
							<p className="example-report__date-range">
								{ translate( 'Since site created on WordPress.com or Jetpack installed' ) }
							</p>
						</div>
						<div className="example-report__grid">
							<ReportCard title={ translate( 'Visitors' ) } value={ reportData.stats.visitors } />
							<ReportCard title={ translate( 'Views' ) } value={ reportData.stats.views } />
							<ReportCard
								title={ translate( 'Most popular time' ) }
								value={ reportData.stats.popularTime }
							/>
							<ReportCard
								title={ translate( 'Most popular day' ) }
								value={ reportData.stats.popularDay }
							/>
						</div>
					</div>
				</div>
			</LayoutBody>
		</Layout>
	);
};

export default ExampleReport;
