import { COLORS } from './colors-values';
import { space } from './space';

const CONTROL_HEIGHT = '36px';

const CONTROL_PROPS = {
	// These values should be shared with TextControl.
	controlPaddingX: 12,
	controlPaddingXSmall: 8,
	controlPaddingXLarge: 12 * 1.3334, // TODO: Deprecate

	controlBoxShadowFocus: `0 0 0 0.5px ${ COLORS.theme.accent }`,
	controlHeight: CONTROL_HEIGHT,
	controlHeightXSmall: `calc( ${ CONTROL_HEIGHT } * 0.6 )`,
	controlHeightSmall: `calc( ${ CONTROL_HEIGHT } * 0.8 )`,
	controlHeightLarge: `calc( ${ CONTROL_HEIGHT } * 1.2 )`,
	controlHeightXLarge: `calc( ${ CONTROL_HEIGHT } * 1.4 )`,
};

// Using Object.assign to avoid creating circular references when emitting
// TypeScript type declarations.
export default Object.assign( {}, CONTROL_PROPS, {
	colorDivider: 'rgba(0, 0, 0, 0.1)',
	colorScrollbarThumb: 'rgba(0, 0, 0, 0.2)',
	colorScrollbarThumbHover: 'rgba(0, 0, 0, 0.5)',
	colorScrollbarTrack: 'rgba(0, 0, 0, 0.04)',
	elevationIntensity: 1,
	radiusXSmall: '1px',
	radiusSmall: '2px',
	radiusMedium: '4px',
	radiusLarge: '8px',
	radiusFull: '9999px',
	radiusRound: '50%',
	borderWidth: '1px',
	borderWidthFocus: '1.5px',
	borderWidthTab: '4px',
	spinnerSize: 16,
	fontSize: '13px',
	fontSizeH1: 'calc(2.44 * 13px)',
	fontSizeH2: 'calc(1.95 * 13px)',
	fontSizeH3: 'calc(1.56 * 13px)',
	fontSizeH4: 'calc(1.25 * 13px)',
	fontSizeH5: '13px',
	fontSizeH6: 'calc(0.8 * 13px)',
	fontSizeInputMobile: '16px',
	fontSizeMobile: '15px',
	fontSizeSmall: 'calc(0.92 * 13px)',
	fontSizeXSmall: 'calc(0.75 * 13px)',
	fontLineHeightBase: '1.4',
	fontWeight: 'normal',
	fontWeightHeading: '600',
	gridBase: '4px',
	cardPaddingXSmall: `${ space( 2 ) }`,
	cardPaddingSmall: `${ space( 4 ) }`,
	cardPaddingMedium: `${ space( 4 ) } ${ space( 6 ) }`,
	cardPaddingLarge: `${ space( 6 ) } ${ space( 8 ) }`,
	elevationXSmall:
		'0 1px 1px rgba(0, 0, 0, 0.03), 0 1px 2px rgba(0, 0, 0, 0.02), 0 3px 3px rgba(0, 0, 0, 0.02), 0 4px 4px rgba(0, 0, 0, 0.01)',
	elevationSmall:
		'0 1px 2px rgba(0, 0, 0, 0.05), 0 2px 3px rgba(0, 0, 0, 0.04), 0 6px 6px rgba(0, 0, 0, 0.03), 0 8px 8px rgba(0, 0, 0, 0.02)',
	elevationMedium:
		'0 2px 3px rgba(0, 0, 0, 0.05), 0 4px 5px rgba(0, 0, 0, 0.04), 0 12px 12px rgba(0, 0, 0, 0.03), 0 16px 16px rgba(0, 0, 0, 0.02)',
	elevationLarge:
		'0 5px 15px rgba(0, 0, 0, 0.08), 0 15px 27px rgba(0, 0, 0, 0.07), 0 30px 36px rgba(0, 0, 0, 0.04), 0 50px 43px rgba(0, 0, 0, 0.02)',
	surfaceBackgroundColor: COLORS.white,
	surfaceBackgroundSubtleColor: '#F3F3F3',
	surfaceBackgroundTintColor: '#F5F5F5',
	surfaceBorderColor: 'rgba(0, 0, 0, 0.1)',
	surfaceBorderBoldColor: 'rgba(0, 0, 0, 0.15)',
	surfaceBorderSubtleColor: 'rgba(0, 0, 0, 0.05)',
	surfaceBackgroundTertiaryColor: COLORS.white,
	surfaceColor: COLORS.white,
	transitionDuration: '200ms',
	transitionDurationFast: '160ms',
	transitionDurationFaster: '120ms',
	transitionDurationFastest: '100ms',
	transitionTimingFunction: 'cubic-bezier(0.08, 0.52, 0.52, 1)',
	transitionTimingFunctionControl: 'cubic-bezier(0.12, 0.8, 0.32, 1)',
} );
