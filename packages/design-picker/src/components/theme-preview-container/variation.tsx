import { useMemo } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import { getPreviewStylesFromVariation } from '../theme-style-variation-badges/utils';
import Iframe from './iframe';
import type { ThemeStyleVariation, ThemeStyleVariationPreviewColorPalette } from '../../types';
import type { ReactNode } from 'react';

const IFRAME_HEIGHT = 48;
const COLOR_SWATCH_SIZE = 8;

interface FlexBoxProps {
	children: ReactNode;
	align?: string;
	justify?: string;
	direction?: 'row' | 'column';
	gap?: number;
	style?: React.CSSProperties;
}

const FlexBox: React.FC< FlexBoxProps > = ( {
	children,
	align = 'center',
	justify = 'center',
	direction = 'row',
	gap = 0,
	style,
} ) => {
	return (
		<div
			style={ {
				alignItems: align,
				display: 'flex',
				flexDirection: direction,
				gap: gap,
				justifyContent: justify,
				...style,
			} }
		>
			{ children }
		</div>
	);
};

interface ColorSwatchProps {
	color: string;
}

const ColorSwatch: React.FC< ColorSwatchProps > = ( { color } ) => {
	return (
		<div
			style={ {
				background: color,
				borderRadius: COLOR_SWATCH_SIZE / 2,
				height: COLOR_SWATCH_SIZE,
				width: COLOR_SWATCH_SIZE,
			} }
		/>
	);
};

interface VariationProps {
	variation: ThemeStyleVariation;
}

const Variation: React.FC< VariationProps > = ( { variation } ) => {
	const translate = useTranslate();
	const styles = useMemo(
		() => variation && getPreviewStylesFromVariation( variation ),
		[ variation ]
	);

	const highlightedColors = useMemo(
		() =>
			styles &&
			Object.entries( styles.color ).reduce( ( filtered, [ key, color ] ) => {
				if ( color !== styles.color.background && color !== styles.color.primary ) {
					filtered[ key as keyof ThemeStyleVariationPreviewColorPalette ] = color;
				}

				return filtered;
			}, {} as ThemeStyleVariationPreviewColorPalette ),
		[ styles ]
	);

	if ( ! styles ) {
		return null;
	}

	return (
		<Iframe
			className="theme-preview-container__variation-iframe"
			style={ { height: IFRAME_HEIGHT } }
			title={ translate( 'Style variation' ) }
		>
			<div
				style={ {
					background: styles.color.background,
					cursor: 'pointer',
					height: IFRAME_HEIGHT,
					width: '100%',
				} }
			>
				<FlexBox gap={ 48 } style={ { height: '100%', overflow: 'hidden' } }>
					<div
						style={ {
							color: styles.color.primary,
							fontSize: 24,
							fontWeight: 400,
						} }
					>
						Aa
					</div>
					<FlexBox direction="column" gap={ 8 }>
						{ highlightedColors &&
							Object.values( highlightedColors ).map( ( color, i ) => (
								<ColorSwatch key={ i } color={ color } />
							) ) }
					</FlexBox>
				</FlexBox>
			</div>
		</Iframe>
	);
};

export default Variation;
