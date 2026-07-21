/* eslint-disable wpcalypso/no-unsafe-wp-apis -- required for editor preview rendering */
import {
	// @ts-ignore -- exists at runtime but not typed
	__unstableEditorStyles as EditorStyles,
	// @ts-ignore -- exists at runtime but not typed
	__unstableIframe as Iframe,
} from '@wordpress/block-editor';
import {
	__experimentalHStack as HStack,
	__unstableMotion as motion,
	__experimentalVStack as VStack,
} from '@wordpress/components';
/* eslint-enable wpcalypso/no-unsafe-wp-apis */
import { useResizeObserver, useThrottle } from '@wordpress/compose';
import { useLayoutEffect, useMemo, useState } from '@wordpress/element';
import deepmerge from 'deepmerge';
import useGlobalStyles from '../../hooks/use-global-styles';

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

const firstFrame = {
	start: {
		scale: 1,
		opacity: 1,
	},
};

const secondFrame = {
	start: {
		scale: 0,
		opacity: 0,
	},
};

const normalizedWidth = 200;
const normalizedHeight = 80;
const normalizedColorSwatchSize = 32;

const THROTTLE_OPTIONS = {
	leading: true,
	trailing: true,
};

/**
 * Resolve a color value that may be a WordPress preset variable to an actual hex color.
 */
function resolveColor(
	editorColor: string | undefined,
	palette: PaletteColor[] | undefined,
	defaultValue: string | null = null
): string | undefined {
	if ( ! editorColor ) {
		return undefined;
	}

	// Handle WordPress block format: var:preset|color|theme-2
	if ( editorColor.includes( 'var:preset|color|' ) ) {
		const slug = editorColor.split( '|' )[ 2 ];
		return palette?.find( ( c ) => c.slug === slug )?.color;
	}

	// Handle CSS variable format: var(--wp--preset--color--theme-2)
	if ( editorColor.includes( 'var(--wp--preset' ) ) {
		const slug = editorColor.split( '--' )[ 4 ]?.replace( ')', '' );
		return palette?.find( ( c ) => c.slug === slug )?.color;
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
		if ( border.color !== undefined ) {
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

// Stable fallback so the merge memo doesn't invalidate on every render.
const EMPTY_GLOBAL_STYLES: GlobalStyles = {};

interface Props {
	label?: string;
	type: 'color' | 'font' | 'button';
	variation?: StyleVariation;
	globalStyles?: GlobalStyles;
	paletteColors?: PaletteColor[];
	themeColors?: PaletteColor[];
	fontFamiliesToCSS?: ( fontFamilies: Array< { name: string; fontFamily: string } > ) => string;
}

export default function StylesPreview( {
	label,
	type,
	variation,
	globalStyles: globalStylesProp,
	paletteColors: paletteColorsProp,
	themeColors: themeColorsProp,
	fontFamiliesToCSS: fontFamiliesToCSSFn,
}: Props ) {
	// Read current global styles from the store. Props override when provided.
	const { globalStyles: storeGlobalStyles } = useGlobalStyles();

	const globalStyles = globalStylesProp ?? storeGlobalStyles ?? EMPTY_GLOBAL_STYLES;
	const paletteColors =
		paletteColorsProp ??
		( ( globalStyles?.settings?.color?.palette as Record< string, unknown > )?.theme as
			| PaletteColor[]
			| undefined ) ??
		[];
	const themeColors = themeColorsProp ?? paletteColors;

	// For typography previews: use ONLY the variation to prevent leaking active global styles.
	// For other types: merge variation with `globalStyles` to get custom colors.
	const mergedStyles: GlobalStyles = useMemo( () => {
		if ( variation && type === 'font' ) {
			return variation as GlobalStyles;
		}
		return variation ? ( deepmerge( globalStyles, variation ) as GlobalStyles ) : globalStyles;
	}, [ variation, type, globalStyles ] );

	const fontFamilies =
		mergedStyles?.settings?.typography?.fontFamilies?.theme ||
		globalStyles?.settings?.typography?.fontFamilies?.theme;

	// Resolve CSS variable font families (e.g. `var(--wp--preset--font-family--bitter)`)
	// to actual font names from the variation's `fontFamilies` settings.
	const FONT_FAMILY_VAR_PREFIX = 'var(--wp--preset--font-family--';
	const resolveFontFamily = ( value: string | undefined ): string | undefined => {
		if ( ! value?.startsWith( FONT_FAMILY_VAR_PREFIX ) ) {
			return value;
		}
		const slug = value.slice( FONT_FAMILY_VAR_PREFIX.length, -1 );
		return fontFamilies?.find( ( f ) => f.slug === slug )?.fontFamily ?? value;
	};

	// Typography
	const fontFamily =
		resolveFontFamily( getStyleValue( mergedStyles, 'typography.fontFamily' ) as string ) ??
		'serif';
	const fontWeight = getStyleValue( mergedStyles, 'typography.fontWeight' ) as string | undefined;
	const fontStyle = ( getStyleValue( mergedStyles, 'typography.fontStyle' ) as string ) ?? 'normal';
	const textTransform =
		( getStyleValue( mergedStyles, 'typography.textTransform' ) as string ) ?? 'none';
	const textColor = ( getStyleValue( globalStyles, 'color.text' ) as string ) ?? 'black';

	// `h1` styles win over `heading` styles for the header preview.
	const getHeaderStyleValue = ( styles: GlobalStyles, path: string ) =>
		( getStyleValue( styles, path, 'h1' ) ?? getStyleValue( styles, path, 'heading' ) ) as string;

	const headerFontFamily =
		resolveFontFamily( getHeaderStyleValue( mergedStyles, 'typography.fontFamily' ) ) ?? fontFamily;
	const headerFontWeight =
		getHeaderStyleValue( mergedStyles, 'typography.fontWeight' ) ?? fontWeight;
	const headerFontStyle = getHeaderStyleValue( mergedStyles, 'typography.fontStyle' ) ?? fontStyle;
	const headerTextTransform =
		getHeaderStyleValue( mergedStyles, 'typography.textTransform' ) ?? textTransform;
	const headerColor = getHeaderStyleValue( globalStyles, 'color.text' ) ?? textColor;
	const backgroundColor = globalStyles?.styles?.color?.background;

	const [ containerResizeListener, { width } ] = useResizeObserver();
	const [ throttledWidth, setThrottledWidthState ] = useState( width );
	const [ ratioState, setRatioState ] = useState< number >();

	const setThrottledWidth = useThrottle( setThrottledWidthState, 250, THROTTLE_OPTIONS );

	const globalPalette = globalStyles?.settings?.color?.palette?.theme;

	const activeTextColor = resolveColor( textColor, globalPalette, 'black' );

	// The variation's own background wins over the active editor background.
	const variationBackgroundColor =
		resolveColor(
			variation?.styles?.color?.background,
			variation?.settings?.color?.palette?.theme
		) ??
		resolveColor( backgroundColor, globalPalette, 'white' ) ??
		'#ffffff';

	// Button previews only.
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
			background: resolveColor( background, globalPalette, '#1E1E1E' ),
		};
	}, [ type, mergedStyles, globalPalette ] );

	useLayoutEffect( () => {
		if ( width ) {
			setThrottledWidth( width );
		}
	}, [ width, setThrottledWidth ] );

	useLayoutEffect( () => {
		const newRatio = throttledWidth ? throttledWidth / normalizedWidth : 1;
		const ratioDiff = newRatio - ( ratioState || 0 );
		const isRatioDiffBigEnough = Math.abs( ratioDiff ) > 0.1;

		if ( isRatioDiffBigEnough || ! ratioState ) {
			setRatioState( newRatio );
		}
	}, [ throttledWidth, ratioState ] );

	const fallbackRatio = width ? width / normalizedWidth : 1;
	const ratio = ratioState ? ratioState : fallbackRatio;

	const getColorsToShow = () => {
		const colorsToShow = variation?.settings?.color?.palette?.theme || themeColors;
		return colorsToShow.filter( ( color ) => color.color !== backgroundColor ).slice( 0, 4 );
	};

	const editorStyles = useMemo( () => {
		return [
			...( type === 'font' && fontFamiliesToCSSFn && fontFamilies
				? [
						{
							css: fontFamiliesToCSSFn( fontFamilies ),
							isGlobalStyles: true,
						},
				  ]
				: [] ),
			{
				css: 'html{overflow:hidden}body{min-width: 0;padding: 0;border: none;}',
				isGlobalStyles: true,
			},
		];
	}, [ fontFamilies, type, fontFamiliesToCSSFn ] );

	return (
		<>
			<div style={ { position: 'relative' } }>{ containerResizeListener }</div>
			<Iframe
				className="edit-site-global-styles-preview__iframe"
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
					initial="start"
				>
					<motion.div
						variants={ firstFrame }
						style={ {
							height: '100%',
							overflow: 'hidden',
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
					</motion.div>
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
					<motion.div
						variants={ secondFrame }
						style={ {
							height: '100%',
							width: '100%',
							overflow: 'hidden',
							position: 'absolute',
							top: 0,
						} }
					>
						<VStack
							spacing={ 3 * ratio }
							justify="center"
							style={ {
								height: '100%',
								overflow: 'hidden',
								padding: 10 * ratio,
								boxSizing: 'border-box',
							} }
						>
							{ label && (
								<div
									style={ {
										fontSize: 40 * ratio,
										fontFamily: headerFontFamily,
										color: type === 'color' ? headerColor : '#1e1e1e',
										fontWeight: headerFontWeight,
										fontStyle: headerFontStyle,
										textTransform: headerTextTransform,
										lineHeight: '1em',
										textAlign: 'center',
									} }
								>
									{ label }
								</div>
							) }
						</VStack>
					</motion.div>
				</motion.div>
			</Iframe>
		</>
	);
}
