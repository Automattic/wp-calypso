import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useResizeObserver } from '@wordpress/compose';
import {
	useSetting,
	useStyle,
} from '@wordpress/edit-site/build-module/components/global-styles/hooks';
import { translate } from 'i18n-calypso';
import { useMemo } from 'react';
import { STYLE_PREVIEW_WIDTH, STYLE_PREVIEW_HEIGHT } from '../../constants';
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
	const [ fontFamilies ] = useSetting( 'typography.fontFamilies' );
	const [ textFontFamily = 'serif' ] = useStyle( 'typography.fontFamily' );
	const [ headingFontFamily = textFontFamily ] = useStyle(
		'elements.heading.typography.fontFamily'
	);
	const [ containerResizeListener, { width } ] = useResizeObserver();
	const ratio = width ? width / STYLE_PREVIEW_WIDTH : 1;

	const getFontFamilyName = ( targetFontFamily: string ) => {
		const fontFamily = fontFamilies.find(
			( { fontFamily }: FontFamily ) => fontFamily === targetFontFamily
		);

		return fontFamily ? fontFamily.name : targetFontFamily;
	};

	const textFontFamilyName = useMemo(
		() => getFontFamilyName( textFontFamily ),
		[ textFontFamily, fontFamilies ]
	);

	const headingFontFamilyName = useMemo(
		() => getFontFamilyName( headingFontFamily ),
		[ headingFontFamily, fontFamilies ]
	);

	return (
		<GlobalStylesVariationContainer
			width={ width }
			ratio={ ratio }
			containerResizeListener={ containerResizeListener }
		>
			<>
				<div
					style={ {
						height: STYLE_PREVIEW_HEIGHT * ratio,
						width: '100%',
						background: 'white',
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
								<VStack spacing={ 4 * ratio } style={ { margin: '16px' } }>
									<div
										title={ headingFontFamilyName }
										aria-label={ headingFontFamilyName }
										style={ {
											...DEFAULT_FONT_STYLES,
											color: '#000000',
											fontSize: '16px',
											fontWeight: 400,
											fontFamily: headingFontFamily,
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
											fontSize: '12px',
											fontWeight: 400,
											fontFamily: textFontFamily,
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
										fontFamily: headingFontFamily,
										color: '#000000',
										fontSize: '16px',
										fontWeight: 400,
										lineHeight: '1em',
										textAlign: 'center',
									} }
								>
									{ translate( 'Default' ) }
								</div>
							</HStack>
						) }
					</div>
				</div>
				<FontFamiliesLoader fontFamilies={ fontFamilies } />
			</>
		</GlobalStylesVariationContainer>
	);
};

export default FontPairingVariationPreview;
