import { __unstableMotion as motion, __experimentalHStack as HStack } from '@wordpress/components';
import { useResizeObserver } from '@wordpress/compose';
import { useGlobalSetting, useGlobalStyle } from '../../gutenberg-bridge';
import GlobalStylesVariationContainer from '../global-styles-variation-container';

const firstFrame = {
	start: {
		scale: 1,
		opacity: 1,
	},
	hover: {
		scale: 0,
		opacity: 0.9,
	},
};

const normalizedWidth = 248;
const normalizedHeight = 50;

interface Props {
	inlineCss?: string;
	onFocusOut?: () => void;
}

const GlobalStylesVariationPreviewColors = ( { inlineCss, onFocusOut }: Props ) => {
	const [ backgroundColor = 'white' ] = useGlobalStyle( 'color.background' );
	const [ gradientValue ] = useGlobalStyle( 'color.gradient' );
	const [ coreColors ] = useGlobalSetting( 'color.palette.core' );
	const [ themeColors ] = useGlobalSetting( 'color.palette.theme' );
	const [ customColors ] = useGlobalSetting( 'color.palette.custom' );
	const [ containerResizeListener, { width } ] = useResizeObserver();
	const ratio = width ? width / normalizedWidth : 1;
	const paletteColors = ( themeColors ?? [] )
		.concat( customColors ?? [] )
		.concat( coreColors ?? [] );

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
					background: gradientValue ?? backgroundColor,
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
						spacing={ 0 }
						justify="center"
						style={ {
							height: '100%',
							overflow: 'hidden',
						} }
					>
						{ paletteColors.slice( 0, 4 ).map( ( { slug, color }, index ) => (
							<div
								key={ `${ slug }-${ index }` }
								style={ {
									flexGrow: 1,
									height: '100%',
									background: color,
								} }
							/>
						) ) }
					</HStack>
				</motion.div>
			</motion.div>
		</GlobalStylesVariationContainer>
	);
};

export default GlobalStylesVariationPreviewColors;
