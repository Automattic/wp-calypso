import {
	Icon,
	people,
	seen,
	calendar,
	tablet,
	home,
	pages,
	reusableBlock,
	chartBar,
} from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import type { ReactNode } from 'react';

interface ReportCardProps {
	title: string;
	value?: string | number;
	children?: ReactNode;
	className?: string;
	icon?: ReactNode;
}

const ReportCard = ( { title, value, children, className, icon }: ReportCardProps ) => (
	<div className={ clsx( 'example-report__card', className ) }>
		<h3 className="example-report__card-title">
			{ icon }
			{ title }
		</h3>
		{ value && <p className="example-report__card-value">{ value }</p> }
		{ children }
	</div>
);

export default function ExampleReport() {
	const translate = useTranslate();

	const agencyName = 'Blue Peak Digital';

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
		<div className="example-report">
			<div className="example-report__content">
				<div className="example-report__header">
					<div className="example-report__header-title">{ translate( 'SITE UPDATE FROM' ) }</div>
					<div className="example-report__header-title">{ agencyName }</div>
					<div className="example-report__header-title">{ reportData.dateRange }</div>
					<div className="example-report__header-heading">{ reportData.siteName }</div>
					<div className="example-report__url">{ reportData.siteUrl }</div>
					<div className="example-report__message">
						{ translate(
							'Hey Mary! Here\'s the monthly report for your site! Notice how the "Repair services" page is lower in traffic than "Book a showing". Let\'s jump on a call to disucss how we can boost that page.'
						) }
						<br />

						{ translate( '—Steve' ) }
					</div>
				</div>

				<div className="example-report__inner-body">
					<div className="example-report__section-title-container">
						<div className="example-report__section-title">{ translate( 'Last 30 days' ) }</div>
					</div>

					<div className="example-report__grid">
						<ReportCard
							title={ translate( 'Visitors' ) }
							value={ reportData.stats.visitors }
							icon={ <Icon icon={ people } /> }
						/>
						<ReportCard
							title={ translate( 'Views' ) }
							value={ reportData.stats.views }
							icon={ <Icon icon={ seen } /> }
						/>
						<ReportCard
							title={ translate( 'Top 5 posts' ) }
							className="example-report__card-list"
							icon={ <Icon icon={ pages } /> }
						>
							<div className="example-report__table-header">
								<span className="example-report__table-header-text">{ translate( 'Name' ) }</span>
								<span className="example-report__table-header-text">{ translate( 'Views' ) }</span>
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
							className="example-report__card-list"
							icon={ <Icon icon={ reusableBlock } /> }
						>
							<div className="example-report__table-header">
								<span className="example-report__table-header-text">{ translate( 'Name' ) }</span>
								<span className="example-report__table-header-text">{ translate( 'Views' ) }</span>
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
							className="example-report__card-list"
							icon={ <Icon icon={ home } /> }
						>
							<div className="example-report__table-header">
								<span className="example-report__table-header-text">{ translate( 'Name' ) }</span>
								<span className="example-report__table-header-text">{ translate( 'Views' ) }</span>
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
							className="example-report__card-list"
							icon={ <Icon icon={ tablet } /> }
						>
							<div className="example-report__table-header">
								<span className="example-report__table-header-text">{ translate( 'Device' ) }</span>
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
						<h2 className="example-report__section-title">{ translate( 'All time' ) }</h2>
					</div>
					<div className="example-report__grid">
						<ReportCard
							title={ translate( 'Visitors' ) }
							value={ reportData.stats.visitors }
							icon={ <Icon icon={ people } /> }
						/>
						<ReportCard
							title={ translate( 'Views' ) }
							value={ reportData.stats.views }
							icon={ <Icon icon={ seen } /> }
						/>
						<ReportCard
							title={ translate( 'Most popular time' ) }
							value={ reportData.stats.popularTime }
							icon={ <Icon icon={ chartBar } /> }
						/>
						<ReportCard
							title={ translate( 'Most popular day' ) }
							value={ reportData.stats.popularDay }
							icon={ <Icon icon={ calendar } /> }
						/>
					</div>
				</div>
				<div className="example-report__footer">
					{ translate( 'Brought to you by %s', { args: agencyName } ) }
				</div>
			</div>
		</div>
	);
}
