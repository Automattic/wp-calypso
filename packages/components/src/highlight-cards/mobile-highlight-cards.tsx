import { Icon } from '@wordpress/icons';
import ShortenedNumber from '../number-formatters';
import { TrendComparison } from './count-comparison-card';
import './style.scss';

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
	const hasValidDisplayValue =
		( count !== null && count !== undefined ) ||
		( preformattedValue !== undefined && preformattedValue.length > 0 );
	if ( ! hasValidDisplayValue ) {
		return null;
	}
	// We require a heading to go with our value.
	const hasValidHeading = heading.length > 0;
	if ( ! hasValidHeading ) {
		return null;
	}
	// The icon and trendline are optional.
	// We require two counts to display a trendline.
	const displayTrendline = previousCount !== null && previousCount !== undefined;
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
				{ preformattedValue ? preformattedValue : <ShortenedNumber value={ count } /> }
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
