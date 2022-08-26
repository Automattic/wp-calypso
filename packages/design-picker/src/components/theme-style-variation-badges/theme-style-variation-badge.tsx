import { useMemo } from 'react';
import type { ThemeStyleVariation, ThemeStyleVariationSettingsColorPalette } from '../../types';
import './style.scss';

interface ThemeStyleVariationBadgeProps {
	variation?: ThemeStyleVariation;
}

const ThemeStyleVariationBadge: React.FC< ThemeStyleVariationBadgeProps > = ( { variation } ) => {
	const { background, primary } = useMemo( () => {
		const palette = variation?.settings?.color?.palette?.theme || [];

		return {
			background: palette.find(
				( item: ThemeStyleVariationSettingsColorPalette ) => item.slug === 'background'
			)?.color,
			primary: palette.find(
				( item: ThemeStyleVariationSettingsColorPalette ) => item.slug === 'primary'
			)?.color,
		};
	}, [ variation ] );

	if ( ! background || ! primary ) {
		return null;
	}

	return (
		<div className="theme-style-variation-wrapper">
			<span
				style={ {
					backgroundColor: background,
					color: primary,
				} }
			>
				A
			</span>
		</div>
	);
};

export default ThemeStyleVariationBadge;
