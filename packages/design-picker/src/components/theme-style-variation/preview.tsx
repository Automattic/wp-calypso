import { useMemo } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import Iframe from './preview-iframe';
import { getPreviewStylesFromVariation } from './utils';
import type {
	ThemeStyleVariation,
	ThemeStyleVariationPreview,
	ThemeStyleVariationPreviewColorPalette,
} from '../../types';
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

interface PreviewProps {
	variation: ThemeStyleVariation;
	coreColors?: ThemeStyleVariationPreview;
}

const Preview: React.FC< PreviewProps > = ( { variation, coreColors } ) => {
	const translate = useTranslate();
	const styles = useMemo(
		() => variation && getPreviewStylesFromVariation( variation, coreColors?.color ),
		[ variation ]
	);

	const highlightedColors = useMemo(
		() =>
			styles &&
			Object.entries( styles.color ).reduce( ( filtered, [ key, color ] ) => {
				if ( color !== styles.color.background && color !== styles.color.foreground ) {
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
			className="theme-style-variation__preview-iframe"
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
							color: styles.color.foreground,
							fontSize: 24,
							fontWeight: 400,
						} }
					>
						Aa
					</div>
					<FlexBox direction="column" gap={ 8 }>
						{ highlightedColors &&
							Object.values( highlightedColors )
								.slice( 0, 2 )
								.map( ( color, i ) => <ColorSwatch key={ i } color={ color } /> ) }
					</FlexBox>
				</FlexBox>
			</div>
		</Iframe>
	);
};

export default Preview;
