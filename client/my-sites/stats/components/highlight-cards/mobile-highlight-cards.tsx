import { formatNumberCompact } from '@automattic/number-formatters';
import { Icon } from '@wordpress/icons';
import TrendComparison from './trend-comparison';
import './style.scss';

// TODO: Figure out a way to remove this and make count-comparison-card handle the mobile layout.

type MobileHighlightCardProps = {
	heading: string;
	count: number | null;
	previousCount?: number | null;
	icon?: React.ReactElement;
	preformattedValue?: string;
};

function MobileHighlightCard( {
	heading,
	count,
	previousCount,
	icon,
	preformattedValue,
}: MobileHighlightCardProps ) {
	// We'll accept a count or a preformatted string as our value.
	// If both are provided, we'll use the preformatted string for display.
	if ( ! preformattedValue && count === null ) {
		return null;
	}
	// We require a heading to go with our value.
	if ( ! heading ) {
		return null;
	}
	// The icon and trendline are optional.
	// Trendline depends on having a previous count value.
	const displayTrendline = Number.isFinite( previousCount );
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
					<TrendComparison count={ count } previousCount={ previousCount } />
				</span>
			) }
			<span className="mobile-highlight-cards__item-count">
				{ preformattedValue ? (
					preformattedValue
				) : (
					<span className="shortened-number">
						{ count !== null ? formatNumberCompact( count ) : '-' }
					</span>
				) }
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
					preformattedValue={ highlight.preformattedValue }
				/>
			) ) }
		</div>
	);
}
