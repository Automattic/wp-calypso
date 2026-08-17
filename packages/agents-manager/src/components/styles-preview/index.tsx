/* eslint-disable wpcalypso/no-unsafe-wp-apis -- required for editor preview rendering */
import {
	// @ts-ignore -- exists at runtime but not typed
	__unstableEditorStyles as EditorStyles,
	// @ts-ignore -- exists at runtime but not typed
	__unstableIframe as Iframe,
} from '@wordpress/block-editor';
import { __experimentalHStack as HStack, __unstableMotion as motion } from '@wordpress/components';
/* eslint-enable wpcalypso/no-unsafe-wp-apis */
import { useResizeObserver, useThrottle } from '@wordpress/compose';
import { useLayoutEffect, useMemo, useState } from '@wordpress/element';
import useGlobalStyles from '../../hooks/use-global-styles';
import { fontFamiliesToCSS } from '../../utils/font-families-to-css';
import mergeGlobalStyles from '../../utils/merge-global-styles';

export interface PaletteColor {
	color: string;
	name?: string;
	slug: string;
}

export interface GlobalStyles {
	settings?: {
		typography?: {
			fontFamilies?: {
				theme?: Array< { name: string; fontFamily: string; slug?: string } >;
			};
		};
		color?: {
			palette?: {
				theme?: PaletteColor[];
			};
		};
	};
	styles?: {
		typography?: {
			fontFamily?: string;
			fontWeight?: string;
			fontStyle?: string;
			textTransform?: string;
		};
		color?: {
			text?: string;
			background?: string;
		};
		elements?: {
			heading?: {
				typography?: {
					fontFamily?: string;
					fontWeight?: string;
					fontStyle?: string;
					textTransform?: string;
				};
				color?: {
					text?: string;
				};
			};
			h1?: {
				typography?: {
					fontFamily?: string;
					fontWeight?: string;
					fontStyle?: string;
					textTransform?: string;
				};
				color?: {
					text?: string;
				};
			};
			button?: {
				color?: {
					background?: string;
					text?: string;
				};
				spacing?: {
					padding?: Record< string, string > | string;
				};
				border?: Record< string, string > | string;
			};
		};
		[ key: string ]: unknown;
	};
	[ key: string ]: unknown;
}

export interface StyleVariation {
	title: string;
	settings?: GlobalStyles[ 'settings' ];
	styles?: GlobalStyles[ 'styles' ];
	[ key: string ]: unknown;
}

/**
 * Read a style value from a global styles object.
 * @param styles  - The global styles object.
 * @param path    - Dot-separated path (e.g. 'typography.fontFamily').
 * @param element - Optional element name (e.g. 'h1', 'heading', 'button').
 */
function getStyleValue(
	styles: GlobalStyles | undefined,
	path: string,
	element?: string
): string | Record< string, string > | undefined {
	if ( ! styles?.styles ) {
		return undefined;
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any -- dynamic style path traversal
	const source = element ? ( styles.styles.elements as any )?.[ element ] : styles.styles;

	if ( ! source ) {
		return undefined;
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any -- dynamic style path traversal
	return path.split( '.' ).reduce( ( obj: any, key: string ) => obj?.[ key ], source );
}

const normalizedWidth = 200;
const normalizedHeight = 80;
const normalizedColorSwatchSize = 32;

/**
 * Resolve a color value that may be a WordPress preset variable to an actual hex color.
 */
function resolveColor(
	editorColor: string | undefined,
	palette: PaletteColor[] | undefined,
	defaultValue: string | null = null
): string | undefined {
	// Colors and palettes can arrive malformed through model-generated props.
	if ( ! editorColor || typeof editorColor !== 'string' ) {
		return undefined;
	}
	const safePalette = Array.isArray( palette ) ? palette : [];

	// Handle WordPress block format: var:preset|color|theme-2
	if ( editorColor.includes( 'var:preset|color|' ) ) {
		const slug = editorColor.split( '|' )[ 2 ];
		return safePalette.find( ( c ) => c?.slug === slug )?.color;
	}

	// Handle CSS variable format: var(--wp--preset--color--theme-2)
	if ( editorColor.includes( 'var(--wp--preset' ) ) {
		const slug = editorColor.split( '--' )[ 4 ]?.replace( ')', '' );
		return safePalette.find( ( c ) => c?.slug === slug )?.color;
	}

	if ( ! defaultValue || editorColor !== defaultValue ) {
		return editorColor;
	}

	return undefined;
}

function getPaddingStyles(
	padding: Record< string, string > | string | undefined
): Record< string, string > {
	if ( ! padding ) {
		return {};
	}

	if ( typeof padding === 'string' ) {
		return { padding };
	}

	if ( typeof padding === 'object' && 'top' in padding ) {
		return {
			paddingTop: padding.top,
			paddingRight: padding.right,
			paddingBottom: padding.bottom,
			paddingLeft: padding.left,
		};
	}

	return { padding: padding as unknown as string };
}

function getBorderStyles(
	border: Record< string, string > | string | undefined
): Record< string, string > {
	if ( ! border ) {
		return {};
	}

	if ( typeof border === 'string' ) {
		return { border };
	}

	if ( typeof border === 'object' ) {
		const borderStyles: Record< string, string > = {};

		if ( border.width !== undefined ) {
			borderStyles.borderWidth = border.width;
		}
		if ( border.style !== undefined ) {
			borderStyles.borderStyle = border.style;
		}
		if ( typeof border.color === 'string' ) {
			borderStyles.borderColor = border.color.replace( ' !important', '' );
		}
		if ( border.radius !== undefined ) {
			borderStyles.borderRadius = border.radius;
		}
		if ( border.width && border.width !== '0' && ! border.style ) {
			borderStyles.borderStyle = 'solid';
		}

		return borderStyles;
	}

	return { border: border as unknown as string };
}

// Stable fallbacks so the memos don't invalidate on every render.
const EMPTY_GLOBAL_STYLES: GlobalStyles = {};
const EMPTY_PALETTE: PaletteColor[] = [];

interface Props {
	type: 'color' | 'font' | 'button';
	variation?: StyleVariation;
}

export default function StylesPreview( { type, variation }: Props ) {
	const { globalStyles: storeGlobalStyles } = useGlobalStyles();

	const globalStyles = storeGlobalStyles ?? EMPTY_GLOBAL_STYLES;
	const paletteColors = globalStyles.settings?.color?.palette?.theme ?? EMPTY_PALETTE;

	// Font previews use the variation alone so the specimen shows its own
	// typography; other types merge over `globalStyles` for custom colors.
	const mergedStyles: GlobalStyles = useMemo( () => {
		if ( variation && type === 'font' ) {
			return variation as GlobalStyles;
		}
		return variation ? mergeGlobalStyles( globalStyles, variation as GlobalStyles ) : globalStyles;
	}, [ variation, type, globalStyles ] );

	const fontFamilies =
		mergedStyles.settings?.typography?.fontFamilies?.theme ||
		globalStyles.settings?.typography?.fontFamilies?.theme;

	// Resolve CSS variable font families (e.g. `var(--wp--preset--font-family--bitter)`)
	// to actual font names from the variation's `fontFamilies` settings.
	const FONT_FAMILY_VAR_PREFIX = 'var(--wp--preset--font-family--';
	const resolveFontFamily = ( value: string | undefined ): string | undefined => {
		if ( typeof value !== 'string' || ! value.startsWith( FONT_FAMILY_VAR_PREFIX ) ) {
			return value;
		}
		const slug = value.slice( FONT_FAMILY_VAR_PREFIX.length, -1 );
		return fontFamilies?.find( ( f ) => f?.slug === slug )?.fontFamily ?? value;
	};

	const fontFamily =
		resolveFontFamily( getStyleValue( mergedStyles, 'typography.fontFamily' ) as string ) ??
		'serif';
	const fontWeight = getStyleValue( mergedStyles, 'typography.fontWeight' ) as string | undefined;
	const fontStyle = ( getStyleValue( mergedStyles, 'typography.fontStyle' ) as string ) ?? 'normal';
	const textColor = ( getStyleValue( globalStyles, 'color.text' ) as string ) ?? 'black';

	// `h1` styles win over `heading` styles for the header preview.
	const getHeaderStyleValue = ( styles: GlobalStyles, path: string ) =>
		( getStyleValue( styles, path, 'h1' ) ?? getStyleValue( styles, path, 'heading' ) ) as string;

	const headerFontFamily =
		resolveFontFamily( getHeaderStyleValue( mergedStyles, 'typography.fontFamily' ) ) ?? fontFamily;
	const headerFontWeight =
		getHeaderStyleValue( mergedStyles, 'typography.fontWeight' ) ?? fontWeight;
	const headerFontStyle = getHeaderStyleValue( mergedStyles, 'typography.fontStyle' ) ?? fontStyle;
	const backgroundColor = globalStyles.styles?.color?.background;

	const [ throttledWidth, setThrottledWidthState ] = useState< number | undefined >();
	const setThrottledWidth = useThrottle( setThrottledWidthState, 250 );
	// Zero widths come from hidden containers (e.g. off-page picker cards) —
	// keeping the last real measurement lets a reveal repaint without resizing.
	const containerResizeRef = useResizeObserver(
		( [ entry ] ) => entry.contentRect.width && setThrottledWidth( entry.contentRect.width )
	);
	const [ ratioState, setRatioState ] = useState< number >();

	const activeTextColor = resolveColor( textColor, paletteColors, 'black' );

	// The variation's own background wins over the active editor background.
	const variationBackgroundColor =
		resolveColor(
			variation?.styles?.color?.background,
			variation?.settings?.color?.palette?.theme
		) ??
		resolveColor( backgroundColor, paletteColors, 'white' ) ??
		'#ffffff';

	const buttonStyles = useMemo( () => {
		if ( type !== 'button' ) {
			return undefined;
		}
		const padding = getStyleValue( mergedStyles, 'spacing.padding', 'button' );
		const border = getStyleValue( mergedStyles, 'border', 'button' );
		const background = getStyleValue( mergedStyles, 'color.background', 'button' ) as string;
		return {
			...getPaddingStyles( padding ),
			...getBorderStyles( border ),
			background: resolveColor( background, paletteColors, '#1E1E1E' ),
		};
	}, [ type, mergedStyles, paletteColors ] );

	useLayoutEffect( () => {
		const newRatio = throttledWidth ? throttledWidth / normalizedWidth : 1;
		const ratioDiff = newRatio - ( ratioState || 0 );
		const isRatioDiffBigEnough = Math.abs( ratioDiff ) > 0.1;

		if ( isRatioDiffBigEnough || ! ratioState ) {
			setRatioState( newRatio );
		}
	}, [ throttledWidth, ratioState ] );

	const fallbackRatio = throttledWidth ? throttledWidth / normalizedWidth : 1;
	const ratio = ratioState ? ratioState : fallbackRatio;

	const getColorsToShow = () => {
		const variationPalette = variation?.settings?.color?.palette?.theme;
		const colorsToShow = Array.isArray( variationPalette ) ? variationPalette : paletteColors;
		return colorsToShow
			.filter( ( color ) => color?.color && color.color !== backgroundColor )
			.slice( 0, 4 );
	};

	const editorStyles = useMemo( () => {
		return [
			...( type === 'font' && fontFamilies
				? [
						{
							css: fontFamiliesToCSS( fontFamilies ),
							isGlobalStyles: true,
						},
				  ]
				: [] ),
			{
				css: 'html{overflow:hidden}body{min-width: 0;padding: 0;border: none;}',
				isGlobalStyles: true,
			},
		];
	}, [ fontFamilies, type ] );

	return (
		<>
			<div ref={ containerResizeRef } />
			<Iframe
				className="agents-manager-styles-preview__iframe"
				style={ {
					width: '100%',
					height: normalizedHeight * ratio,
				} }
				tabIndex={ -1 }
			>
				<EditorStyles styles={ editorStyles } />
				<motion.div
					style={ {
						height: normalizedHeight * ratio,
						width: '100%',
						background: variationBackgroundColor,
						cursor: 'pointer',
					} }
				>
					<HStack
						spacing={ 10 * ratio }
						justify="center"
						style={ {
							height: '100%',
							overflow: 'hidden',
						} }
					>
						{ type === 'font' && (
							<div
								style={ {
									color: activeTextColor || '#000000',
									whiteSpace: 'nowrap',
									paddingLeft: '5px',
									lineHeight: 1,
									padding: '0.2em',
								} }
							>
								<span
									style={ {
										fontFamily: headerFontFamily,
										fontSize: 50 * ratio,
										fontWeight: headerFontWeight,
										fontStyle: headerFontStyle,
										textTransform: 'none',
									} }
								>
									A
								</span>
								<span
									style={ {
										fontFamily,
										fontSize: 40 * ratio,
										fontWeight,
										fontStyle,
										textTransform: 'none',
									} }
								>
									a
								</span>
							</div>
						) }
						{ type === 'color' && (
							<HStack spacing={ 0 } alignment="center" style={ { margin: '0 0 0 10px' } }>
								{ getColorsToShow().map( ( { slug, color }, index ) => (
									<div
										key={ `${ slug }_${ index }` }
										style={ {
											height: normalizedColorSwatchSize * ratio,
											width: normalizedColorSwatchSize * ratio,
											background: color,
											borderRadius: '100%',
											margin: '0 0 0 -10px',
											border: `2px solid ${ variationBackgroundColor }`,
											boxSizing: 'content-box',
										} }
									/>
								) ) }
							</HStack>
						) }
						{ type === 'button' && (
							<motion.div
								style={ {
									color: activeTextColor || '#000000',
									whiteSpace: 'nowrap',
									paddingLeft: '5px',
									lineHeight: 1,
									padding: '0.2em',
								} }
								animate={ { scale: 1, opacity: 1 } }
								initial={ { scale: 0.1, opacity: 0 } }
								transition={ {
									delay: 0.3,
									type: 'tween',
								} }
							>
								<div style={ { zoom: 0.8 } }>
									<button style={ buttonStyles }> </button>
								</div>
							</motion.div>
						) }
					</HStack>
					<motion.div
						style={ {
							height: '100%',
							width: '100%',
							position: 'absolute',
							top: 0,
							overflow: 'hidden',
							filter: 'blur(60px)',
							opacity: 0.1,
						} }
					>
						<HStack
							spacing={ 0 }
							justify="flex-start"
							style={ {
								height: '100%',
								overflow: 'hidden',
							} }
						>
							{ paletteColors.slice( 0, 4 ).map( ( { color }, index ) => (
								<div
									key={ index }
									style={ {
										height: '100%',
										background: color,
										flexGrow: 1,
									} }
								/>
							) ) }
						</HStack>
					</motion.div>
				</motion.div>
			</Iframe>
		</>
	);
}
