import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useResizeObserver } from '@wordpress/compose';
import {
	useSetting,
	useStyle,
} from '@wordpress/edit-site/build-module/components/global-styles/hooks';
import { useMemo, useState } from 'react';
import { FONT_PREVIEW_WIDTH, FONT_PREVIEW_HEIGHT, SYSTEM_FONT_SLUG } from '../../constants';
import GlobalStylesVariationContainer from '../global-styles-variation-container';
import FontFamiliesLoader from './font-families-loader';
import type { FontFamily } from '../../types';

const DEFAULT_FONT_STYLES: React.CSSProperties = {
	fontSize: '13.5vw', // 18px for min-width wide breakpoint and 15px for max-width wide
	textAlign: 'center',
	color: '#000000',
};

const FontPairingVariationPreview = () => {
	const [ fontFamilies ] = useSetting( 'typography.fontFamilies' ) as [ FontFamily[] ];

	const [ textFontFamily = 'serif' ] = useStyle( 'typography.fontFamily' );
	const [ textFontStyle = 'normal' ] = useStyle( 'typography.fontStyle' );
	const [ textLetterSpacing = '-0.15px' ] = useStyle( 'typography.letterSpacing' );
	const [ textFontWeight = 400 ] = useStyle( 'typography.fontWeight' );

	const [ headingFontFamily = textFontFamily ] = useStyle(
		'elements.heading.typography.fontFamily'
	);
	const [ headingFontStyle = textFontStyle ] = useStyle( 'elements.heading.typography.fontStyle' );
	const [ headingFontWeight = textFontWeight ] = useStyle(
		'elements.heading.typography.fontWeight'
	);
	const [ headingLetterSpacing = textLetterSpacing ] = useStyle(
		'elements.heading.typography.letterSpacing'
	);

	const [ containerResizeListener, { width } ] = useResizeObserver();
	const ratio = width ? width / FONT_PREVIEW_WIDTH : 1;
	const normalizedHeight = Math.ceil( FONT_PREVIEW_HEIGHT * ratio );
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
						<HStack
							spacing={ 10 * ratio }
							justify="flex-start"
							style={ {
								height: '100%',
								overflow: 'hidden',
							} }
						>
							<VStack spacing={ 1 } style={ { margin: '10px', width: '100%' } }>
								<div
									aria-label={ headingFontFamilyName }
									style={ {
										...DEFAULT_FONT_STYLES,
										lineHeight: '22px',
										letterSpacing: headingLetterSpacing,
										fontWeight: headingFontWeight,
										fontFamily: headingFontFamily,
										fontStyle: headingFontStyle,
									} }
								>
									{ headingFontFamilyName }
								</div>
								<div
									aria-label={ textFontFamilyName }
									style={ {
										...DEFAULT_FONT_STYLES,
										fontSize: '13px',
										lineHeight: '23px',
										letterSpacing: textLetterSpacing,
										fontWeight: textFontWeight,
										fontFamily: textFontFamily,
										fontStyle: textFontStyle,
									} }
								>
									{ textFontFamilyName }
								</div>
							</VStack>
						</HStack>
					</div>
				</div>
				<FontFamiliesLoader fontFamilies={ externalFontFamilies } onLoad={ handleOnLoad } />
			</>
		</GlobalStylesVariationContainer>
	);
};

export default FontPairingVariationPreview;
