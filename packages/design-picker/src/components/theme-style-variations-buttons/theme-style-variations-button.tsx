import { createElement, useMemo } from 'react';
import type { ThemeStyleVariation, ThemeStyleVariationSettingsColorPalette } from '../../types';
import './style.scss';

interface ThemeStyleVariationsButtonProps {
	text?: string;
	tagName?: string;
	variation?: ThemeStyleVariation;
}

const ThemeStyleVariationsButton: React.FC< ThemeStyleVariationsButtonProps > = ( {
	text = 'A',
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
				text
			) }
		</div>
	);
};

export default ThemeStyleVariationsButton;
