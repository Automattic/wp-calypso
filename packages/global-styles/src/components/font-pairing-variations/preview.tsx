import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useResizeObserver } from '@wordpress/compose';
import { translate } from 'i18n-calypso';
import { useMemo, useState } from 'react';
import { STYLE_PREVIEW_WIDTH, STYLE_PREVIEW_HEIGHT, SYSTEM_FONT_SLUG } from '../../constants';
import { useGlobalSetting, useGlobalStyle } from '../../gutenberg-bridge';
import GlobalStylesVariationContainer from '../global-styles-variation-container';
import FontFamiliesLoader from './font-families-loader';
import type { FontFamily } from '../../types';

const DEFAULT_FONT_STYLES: React.CSSProperties = {
	whiteSpace: 'nowrap',
	overflow: 'hidden',
	textOverflow: 'ellipsis',
};

interface Props {
	title?: string;
}

const FontPairingVariationPreview = ( { title }: Props ) => {
	const [ fontFamilies ] = useGlobalSetting( 'typography.fontFamilies.theme' ) as [ FontFamily[] ];
	const [ textFontFamily = 'serif' ] = useGlobalStyle( 'typography.fontFamily' );
	const [ textFontStyle = 'normal' ] = useGlobalStyle( 'typography.fontStyle' );
	const [ textFontWeight = 400 ] = useGlobalStyle( 'typography.fontWeight' );
	const [ headingFontFamily = textFontFamily ] = useGlobalStyle(
		'elements.heading.typography.fontFamily'
	);
	const [ headingFontStyle = textFontStyle ] = useGlobalStyle(
		'elements.heading.typography.fontStyle'
	);
	const [ headingFontWeight = textFontWeight ] = useGlobalStyle(
		'elements.heading.typography.fontWeight'
	);
	const [ containerResizeListener, { width } ] = useResizeObserver();
	const ratio = width ? width / STYLE_PREVIEW_WIDTH : 1;
	const normalizedHeight = Math.ceil( STYLE_PREVIEW_HEIGHT * ratio * 0.5 );
	const externalFontFamilies = fontFamilies.filter( ( { slug } ) => slug !== SYSTEM_FONT_SLUG );
	const [ isLoaded, setIsLoaded ] = useState( ! externalFontFamilies.length );
	const getFontFamilyName = ( targetFontFamily: string ) => {
		const fontFamily = fontFamilies.find( ( { fontFamily } ) => fontFamily === targetFontFamily );
		return fontFamily?.name || fontFamily?.fontFamily || targetFontFamily;
	};

	const textFontFamilyName = useMemo(
		() => getFontFamilyName( textFontFamily ),
		[ textFontFamily, fontFamilies ]
	);

	const headingFontFamilyName = useMemo(
		() => getFontFamilyName( headingFontFamily ),
		[ headingFontFamily, fontFamilies ]
	);

	const handleOnLoad = () => setIsLoaded( true );

	return (
		<GlobalStylesVariationContainer
			width={ width }
			height={ normalizedHeight }
			containerResizeListener={ containerResizeListener }
		>
			<>
				<div
					style={ {
						// Apply the normalized height only when the width is available
						height: width ? normalizedHeight : 0,
						width: '100%',
						background: 'white',
						opacity: isLoaded ? 1 : 0,
						cursor: 'pointer',
					} }
				>
					<div
						style={ {
							height: '100%',
							overflow: 'hidden',
						} }
					>
						{ title ? (
							<HStack
								spacing={ 10 * ratio }
								justify="flex-start"
								style={ {
									height: '100%',
									overflow: 'hidden',
								} }
							>
								<VStack spacing={ 1 } style={ { margin: '16px' } }>
									<div
										title={ headingFontFamilyName }
										aria-label={ headingFontFamilyName }
										style={ {
											...DEFAULT_FONT_STYLES,
											color: '#000000',
											fontSize: '16px',
											fontWeight: headingFontWeight,
											fontFamily: headingFontFamily,
											fontStyle: headingFontStyle,
										} }
									>
										{ headingFontFamilyName }
									</div>
									<div
										title={ textFontFamilyName }
										aria-label={ textFontFamilyName }
										style={ {
											...DEFAULT_FONT_STYLES,
											color: '#444444',
											fontSize: '14px',
											fontWeight: textFontWeight,
											fontFamily: textFontFamily,
											fontStyle: textFontStyle,
										} }
									>
										{ textFontFamilyName }
									</div>
								</VStack>
							</HStack>
						) : (
							<HStack
								align="center"
								justify="flex-start"
								style={ {
									height: '100%',
									overflow: 'hidden',
									padding: '16px',
									boxSizing: 'border-box',
								} }
							>
								<div
									style={ {
										fontFamily: textFontFamily,
										fontStyle: textFontStyle,
										color: '#000000',
										fontSize: '16px',
										fontWeight: textFontWeight,
										lineHeight: '1em',
										textAlign: 'center',
									} }
								>
									{ translate( 'Default', {
										comment: 'The default value of the font pairing',
									} ) }
								</div>
							</HStack>
						) }
					</div>
				</div>
				<FontFamiliesLoader fontFamilies={ externalFontFamilies } onLoad={ handleOnLoad } />
			</>
		</GlobalStylesVariationContainer>
	);
};

export default FontPairingVariationPreview;
