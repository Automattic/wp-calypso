import { Card } from '@automattic/components';
import { Icon, people, postContent, starEmpty, commentContent } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';

import './style.scss';

const FORMATTER = new Intl.NumberFormat( 'en-GB' );
const COMPACT_FORMATTER = new Intl.NumberFormat( 'en-GB', {
	notation: 'compact',
	compactDisplay: 'short',
	maximumFractionDigits: 1,
} );

function formatNumber( number: number | null, isCompact = false ) {
	const formatter = isCompact ? COMPACT_FORMATTER : FORMATTER;

	return Number.isFinite( number ) ? formatter.format( number as number ) : '-';
}

export default function AllTimeHighlightsSection() {
	const translate = useTranslate();

	const infoItems = [
		{ id: 'views', icon: people, title: translate( 'Views' ), count: 47865778 },
		{ id: 'visitors', icon: people, title: translate( 'Visitors' ), count: 22787774 },
		{ id: 'posts', icon: postContent, title: translate( 'Posts' ), count: 2582 },
		{ id: 'likes', icon: starEmpty, title: translate( 'Likes' ), count: 13092212 },
		{ id: 'comments', icon: commentContent, title: translate( 'Comments' ), count: 45130 },
	];

	const mostPopularTimeItems = {
		id: 'mostPopularTime',
		heading: translate( 'Most popular time' ),
		items: [
			{
				id: 'bestDay',
				header: translate( 'Best day' ),
				content: 'Thursday',
				footer: translate( '%p% of views', { args: [ 25 ] } ),
			},
			{
				id: 'bestHour',
				header: translate( 'Best hour' ),
				content: '2 PM',
				footer: translate( '%p% of views', { args: [ 18 ] } ),
			},
		],
	};

	const bestViewsEverItems = {
		id: 'bestViewsEver',
		heading: translate( 'Best views ever' ),
		items: [
			{
				id: 'day',
				header: translate( 'Day' ),
				content: 'June 23',
				footer: 2022,
			},
			{
				id: 'views',
				header: translate( 'Views' ),
				content: formatNumber( 32823, true ),
				footer: translate( '%p% of views', { args: [ 25 ] } ),
			},
		],
	};

	return (
		<div className="stats__all-time-highlights-section">
			<div className="highlight-cards">
				<h1 className="highlight-cards-heading">{ translate( 'All-time highlights' ) }</h1>

				<div className="highlight-cards-list">
					<Card className="highlight-card">
						<div className="highlight-card-heading">{ translate( 'All-time stats' ) }</div>
						<div className="highlight-card-info-item-list">
							{ infoItems.map( ( info ) => {
								return (
									<div key={ info.id } className="highlight-card-info-item">
										<Icon icon={ info.icon } />

										<span className="highlight-card-info-item-title">{ info.title }</span>

										<span
											className="highlight-card-info-item-count"
											title={ Number.isFinite( info.count ) ? String( info.count ) : undefined }
										>
											{ formatNumber( info.count ) }
										</span>
									</div>
								);
							} ) }
						</div>
					</Card>

					{ [ mostPopularTimeItems, bestViewsEverItems ].map( ( card ) => {
						return (
							<Card key={ card.id } className="highlight-card">
								<div className="highlight-card-heading">{ card.heading }</div>
								<div className="highlight-card-detail-item-list">
									{ card.items.map( ( item ) => {
										return (
											<div key={ item.id } className="highlight-card-detail-item">
												<div className="highlight-card-detail-item-header">{ item.header }</div>

												<div className="highlight-card-detail-item-content">{ item.content }</div>

												<div className="highlight-card-detail-item-footer">{ item.footer }</div>
											</div>
										);
									} ) }
								</div>
							</Card>
						);
					} ) }
				</div>
			</div>
		</div>
	);
}
