// This file is a copy of https://github.com/WordPress/gutenberg/blob/8a4916feb4317234d3187435f2286e95a8a95d55/packages/edit-site/src/components/global-styles/preview.js.
// Customizations are indicated with a "Custom WP.com code" comment.
//
// The reason this component is not imported directly from @wordpress/edit-site is that currently Calypso
// uses version 4.6.0. Updating @wordpress/edit-site affects other packages which also depends on 4.6.0.
// This creates a complex scenario where updating @wordpress/edit-site also bumps many other
// @wordpress/* packages, some of them across major versions.

/**
 * WordPress dependencies
 */
import {
	__unstableIframe as Iframe,
	__unstableEditorStyles as EditorStyles,
} from '@wordpress/block-editor';
import {
	__unstableMotion as motion,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useReducedMotion, useResizeObserver } from '@wordpress/compose';
import {
	useSetting,
	useStyle,
} from '@wordpress/edit-site/build-module/components/global-styles/hooks';
import { useGlobalStylesOutput } from '@wordpress/edit-site/build-module/components/global-styles/use-global-styles-output';
import { useState, useMemo } from '@wordpress/element';

const firstFrame = {
	start: {
		scale: 1,
		opacity: 1,
	},
	hover: {
		scale: 0,
		opacity: 0,
	},
};

const midFrame = {
	hover: {
		opacity: 1,
	},
	start: {
		opacity: 0.5,
	},
};

const secondFrame = {
	hover: {
		scale: 1,
		opacity: 1,
	},
	start: {
		scale: 0,
		opacity: 0,
	},
};

const normalizedWidth = 248;
const normalizedHeight = 152;

const normalizedColorSwatchSize = 32;

const StylesPreview = ( { label, isFocused, withHoverView } ) => {
	const [ fontWeight ] = useStyle( 'typography.fontWeight' );
	const [ fontFamily = 'serif' ] = useStyle( 'typography.fontFamily' );
	const [ headingFontFamily = fontFamily ] = useStyle( 'elements.h1.typography.fontFamily' );
	const [ headingFontWeight = fontWeight ] = useStyle( 'elements.h1.typography.fontWeight' );
	const [ textColor = 'black' ] = useStyle( 'color.text' );
	const [ headingColor = textColor ] = useStyle( 'elements.h1.color.text' );
	const [ backgroundColor = 'white' ] = useStyle( 'color.background' );
	const [ gradientValue ] = useStyle( 'color.gradient' );
	const [ styles ] = useGlobalStylesOutput();
	const disableMotion = useReducedMotion();
	const [ coreColors ] = useSetting( 'color.palette.core' );
	const [ themeColors ] = useSetting( 'color.palette.theme' );
	const [ customColors ] = useSetting( 'color.palette.custom' );
	const [ isHovered, setIsHovered ] = useState( false );
	const [ containerResizeListener, { width } ] = useResizeObserver();
	const ratio = width ? width / normalizedWidth : 1;

	const paletteColors = ( themeColors ?? [] )
		.concat( customColors ?? [] )
		.concat( coreColors ?? [] );
	const highlightedColors = paletteColors
		.filter(
			// we exclude these two colors because they are already visible in the preview.
			( { color } ) => color !== backgroundColor && color !== headingColor
		)
		.slice( 0, 2 );

	// Reset leaked styles from WP common.css and remove main content layout padding and border.
	const editorStyles = useMemo( () => {
		if ( styles ) {
			return [
				...styles,
				{
					// Custom WP.com code - START.
					css: 'html{overflow:hidden}body{min-width: 0;padding: 0;border: none;transform:scale(1);}',
					// Custom WP.com code - END.
					isGlobalStyles: true,
				},
			];
		}

		return styles;
	}, [ styles ] );
	const isReady = !! width;

	return (
		<>
			<div style={ { position: 'relative' } }>{ containerResizeListener }</div>
			{ isReady && (
				<Iframe
					className="edit-site-global-styles-preview__iframe"
					head={ <EditorStyles styles={ editorStyles } /> }
					style={ {
						height: normalizedHeight * ratio,
					} }
					onMouseEnter={ () => setIsHovered( true ) }
					onMouseLeave={ () => setIsHovered( false ) }
					tabIndex={ -1 }
				>
					<motion.div
						style={ {
							height: normalizedHeight * ratio,
							width: '100%',
							background: gradientValue ?? backgroundColor,
							cursor: 'pointer',
						} }
						initial="start"
						animate={ ( isHovered || isFocused ) && ! disableMotion && label ? 'hover' : 'start' }
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
								<motion.div
									style={ {
										fontFamily: headingFontFamily,
										fontSize: 65 * ratio,
										color: headingColor,
										fontWeight: headingFontWeight,
									} }
									animate={ { scale: 1, opacity: 1 } }
									initial={ { scale: 0.1, opacity: 0 } }
									transition={ { delay: 0.3, type: 'tween' } }
								>
									Aa
								</motion.div>
								<VStack spacing={ 4 * ratio }>
									{ highlightedColors.map( ( { slug, color }, index ) => (
										<motion.div
											key={ slug }
											style={ {
												height: normalizedColorSwatchSize * ratio,
												width: normalizedColorSwatchSize * ratio,
												background: color,
												borderRadius: ( normalizedColorSwatchSize * ratio ) / 2,
											} }
											animate={ { scale: 1, opacity: 1 } }
											initial={ { scale: 0.1, opacity: 0 } }
											transition={ {
												delay: index === 1 ? 0.2 : 0.1,
											} }
										/>
									) ) }
								</VStack>
							</HStack>
						</motion.div>
						<motion.div
							variants={ withHoverView && midFrame }
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
											fontFamily: headingFontFamily,
											color: headingColor,
											fontWeight: headingFontWeight,
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
			) }
		</>
	);
};

export default StylesPreview;
