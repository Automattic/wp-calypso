import { useMemo } from 'react';
import ThemeStyleVariationsButton from './theme-style-variations-button';
import type { ThemeStyleVariation } from '../../types';
import './style.scss';

interface ThemeStyleVariationsButtonProps {
	tagName?: string;
	maxVariationsToShow?: number;
	variations: ThemeStyleVariation[];
}

const ThemeStyleVariationsButtons: React.FC< ThemeStyleVariationsButtonProps > = ( {
	tagName = 'button',
	maxVariationsToShow = 4,
	variations = [],
} ) => {
	const variationsToShow = useMemo(
		() => variations.slice( 0, maxVariationsToShow ),
		[ variations ]
	);

	return (
		<>
			{ variationsToShow.map( ( variation ) => (
				<ThemeStyleVariationsButton
					key={ variation.slug }
					tagName={ tagName }
					variation={ variation }
				/>
			) ) }
			{ variations.length > variationsToShow.length && (
				<ThemeStyleVariationsButton
					tagName={ tagName }
					text={ `+${ variations.length - variationsToShow.length }` }
				/>
			) }
		</>
	);
};

export default ThemeStyleVariationsButtons;
