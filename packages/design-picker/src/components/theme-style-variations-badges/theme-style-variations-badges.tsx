import { createElement, useMemo } from 'react';
import ThemeStyleVariationsBadge from './theme-style-variations-badge';
import type { ThemeStyleVariation } from '../../types';
import './style.scss';

interface ThemeStyleVariationsBadgesProps {
	tagName?: string;
	maxVariationsToShow?: number;
	variations: ThemeStyleVariation[];
}

const ThemeStyleVariationsBadges: React.FC< ThemeStyleVariationsBadgesProps > = ( {
	tagName = 'button',
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
				<ThemeStyleVariationsBadge
					key={ variation.slug }
					tagName={ tagName }
					variation={ variation }
				/>
			) ) }
			{ variations.length > variationsToShow.length && (
				<div className="theme-style-variations-more-wrapper">
					{ createElement( tagName, null, `+${ variations.length - variationsToShow.length }` ) }
				</div>
			) }
		</>
	);
};

export default ThemeStyleVariationsBadges;
