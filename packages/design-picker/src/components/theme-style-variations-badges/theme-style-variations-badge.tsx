import { createElement, useMemo } from 'react';
import type { ThemeStyleVariation, ThemeStyleVariationSettingsColorPalette } from '../../types';
import './style.scss';

interface ThemeStyleVariationsBadgeProps {
	tagName?: string;
	variation?: ThemeStyleVariation;
}

const ThemeStyleVariationsBadge: React.FC< ThemeStyleVariationsBadgeProps > = ( {
	tagName = 'button',
	variation,
} ) => {
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
			{ createElement(
				tagName,
				{
					style: {
						backgroundColor: background,
						color: primary,
					},
					...( tagName === 'button' && { type: 'button' } ),
				},
				'A'
			) }
		</div>
	);
};

export default ThemeStyleVariationsBadge;
