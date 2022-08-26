import { useMemo } from 'react';
import ThemeStyleVariationBadge from './theme-style-variation-badge';
import type { ThemeStyleVariation } from '../../types';
import './style.scss';

interface ThemeStyleVariationBadgesProps {
	maxVariationsToShow?: number;
	variations: ThemeStyleVariation[];
}

const ThemeStyleVariationBadges: React.FC< ThemeStyleVariationBadgesProps > = ( {
	maxVariationsToShow = 4,
	variations = [],
} ) => {
	const variationsToShow = useMemo(
		() => variations.slice( 0, maxVariationsToShow ),
		[ variations, maxVariationsToShow ]
	);

	return (
		<>
			{ variationsToShow.map( ( variation ) => (
				<ThemeStyleVariationBadge key={ variation.slug } variation={ variation } />
			) ) }
			{ variations.length > variationsToShow.length && (
				<div className="theme-style-variations-more-wrapper">
					<span>{ `+${ variations.length - variationsToShow.length }` }</span>
				</div>
			) }
		</>
	);
};

export default ThemeStyleVariationBadges;
