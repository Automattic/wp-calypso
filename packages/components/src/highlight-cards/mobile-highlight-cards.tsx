import { Icon } from '@wordpress/icons';
import ShortenedNumber from '../number-formatters';
import { TrendComparison } from './count-comparison-card';
import './style.scss';

type MobileHighlightCardProps = {
	heading: string;
	count: number | null;
	previousCount?: number | null;
	icon?: any;
};

function MobileHighlightCard( { heading, count, previousCount, icon }: MobileHighlightCardProps ) {
	// We require at minimum a heading and a count.
	const isValidHighlight = count !== null || heading.length > 0;
	if ( ! isValidHighlight ) {
		return null;
	}
	// We require two counts to display a trendline.
	// The icon is optional.
	const displayTrendline = count !== null && previousCount !== null;
	const displayIcon = icon !== undefined;
	return (
		<div className="mobile-highlight-cards__item">
			{ displayIcon && (
				<span className="mobile-highlight-cards__item-icon">
					<Icon icon={ icon } />
				</span>
			) }
			<span className="mobile-highlight-cards__item-heading">{ heading }</span>
			{ displayTrendline && (
				<span className="mobile-highlight-cards__item-trend">
					<TrendComparison count={ count ?? null } previousCount={ previousCount ?? null } />
				</span>
			) }
			<span className="mobile-highlight-cards__item-count">
				<ShortenedNumber value={ count ?? null } />
			</span>
		</div>
	);
}

type MobileHighlightCardListingProps = {
	highlights: MobileHighlightCardProps[];
};

export default function MobileHighlightCardListing( {
	highlights,
}: MobileHighlightCardListingProps ) {
	return (
		<div className="mobile-highlight-cards-listing">
			{ highlights.map( ( highlight ) => (
				<MobileHighlightCard
					key={ highlight.heading }
					heading={ highlight.heading }
					count={ highlight.count }
					previousCount={ highlight.previousCount }
					icon={ highlight.icon }
				/>
			) ) }
		</div>
	);
}
