import { __unstableMotion as motion, __experimentalHStack as HStack } from '@wordpress/components';
import { useResizeObserver } from '@wordpress/compose';
import { useContext } from 'react';
import { GlobalStylesContext, useGlobalStyle } from '../../gutenberg-bridge';
import GlobalStylesVariationContainer from '../global-styles-variation-container';
import { getFamilyPreviewStyle } from './utils';

function getFontFamilyFromSetting( fontFamilies, setting ) {
	if ( ! Array.isArray( fontFamilies ) || ! setting ) {
		return null;
	}

	const fontFamilyVariable = setting.replace( 'var(', '' ).replace( ')', '' );
	const fontFamilySlug = fontFamilyVariable?.split( '--' ).slice( -1 )[ 0 ];

	return fontFamilies.find( ( fontFamily ) => fontFamily.slug === fontFamilySlug );
}

function getFontFamilies( themeJson ) {
	const themeFontFamilies = themeJson?.settings?.typography?.fontFamilies?.theme;
	const customFontFamilies = themeJson?.settings?.typography?.fontFamilies?.custom;

	let fontFamilies = [];
	if ( themeFontFamilies && customFontFamilies ) {
		fontFamilies = [ ...themeFontFamilies, ...customFontFamilies ];
	} else if ( themeFontFamilies ) {
		fontFamilies = themeFontFamilies;
	} else if ( customFontFamilies ) {
		fontFamilies = customFontFamilies;
	}
	const bodyFontFamilySetting = themeJson?.styles?.typography?.fontFamily;
	const bodyFontFamily = getFontFamilyFromSetting( fontFamilies, bodyFontFamilySetting );

	const headingFontFamilySetting = themeJson?.styles?.elements?.heading?.typography?.fontFamily;

	let headingFontFamily;
	if ( ! headingFontFamilySetting ) {
		headingFontFamily = bodyFontFamily;
	} else {
		headingFontFamily = getFontFamilyFromSetting(
			fontFamilies,
			themeJson?.styles?.elements?.heading?.typography?.fontFamily
		);
	}

	return [ bodyFontFamily, headingFontFamily ];
}

const normalizedWidth = 158;
const normalizedHeight = 101;

interface Props {
	fontSize?: number;
	inlineCss?: string;
	onFocusOut?: () => void;
}

const GlobalStylesVariationPreviewTypography = ( {
	fontSize = 36,
	inlineCss,
	onFocusOut,
}: Props ) => {
	const { merged } = useContext( GlobalStylesContext );
	const [ containerResizeListener, { width } ] = useResizeObserver();
	const ratio = width ? width / normalizedWidth : 1;

	const [ textColor = 'black' ] = useGlobalStyle( 'color.text' );

	const [ bodyFontFamilies, headingFontFamilies ] = getFontFamilies( merged );
	const bodyPreviewStyle = bodyFontFamilies ? getFamilyPreviewStyle( bodyFontFamilies ) : {};
	const headingPreviewStyle = headingFontFamilies
		? getFamilyPreviewStyle( headingFontFamilies )
		: {};

	if ( textColor ) {
		bodyPreviewStyle.color = textColor;
		headingPreviewStyle.color = textColor;
	}

	if ( fontSize ) {
		bodyPreviewStyle.fontSize = fontSize;
		headingPreviewStyle.fontSize = fontSize;
	}

	return (
		<GlobalStylesVariationContainer
			width={ width }
			height={ normalizedHeight * ratio }
			inlineCss={ inlineCss }
			containerResizeListener={ containerResizeListener }
			onFocusOut={ onFocusOut }
		>
			<motion.div
				style={ {
					height: normalizedHeight * ratio,
					width: '100%',
					cursor: 'pointer',
				} }
			>
				<HStack
					spacing={ 10 * ratio }
					justify="center"
					align="center"
					style={ {
						height: '100%',
						overflow: 'hidden',
					} }
				>
					<motion.div>
						<span style={ headingPreviewStyle }>A</span>
						<span style={ bodyPreviewStyle }>a</span>
					</motion.div>
				</HStack>
			</motion.div>
		</GlobalStylesVariationContainer>
	);
};

export default GlobalStylesVariationPreviewTypography;
