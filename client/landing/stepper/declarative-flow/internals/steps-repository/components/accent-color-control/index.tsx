/* eslint-disable wpcalypso/jsx-classname-namespace */
import { Popover } from '@automattic/components';
import { useLocale } from '@automattic/i18n-utils';
import { hasMinContrast, hexToRgb, RGB } from '@automattic/onboarding';
import { ColorPicker } from '@wordpress/components';
import { Icon, color } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import classNames from 'classnames';
import { Dispatch, SetStateAction, useState, useRef } from 'react';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import PremiumBadge from 'calypso/components/premium-badge';
import { SelectDropdownForwardingRef as SelectDropdown } from 'calypso/components/select-dropdown';
import { usePremiumGlobalStyles } from 'calypso/landing/stepper/hooks/use-premium-global-styles';
import { tip } from 'calypso/signup/icons';
import './style.scss';
import ColorSwatch from './color-swatch';

interface AccentColorControlProps {
	accentColor: AccentColor;
	setAccentColor: Dispatch< SetStateAction< AccentColor > >;
}

export type AccentColor = {
	hex: string;
	rgb: RGB;
	default?: boolean;
};

enum COLORS {
	Lettre = '#1D39EB',
	Black = '#000000',
	LuminousVividOrange = '#F4732B',
	VividPurple = '#925CD9',
}

const COLOR_OPTIONS = [
	{
		label: 'Lettre',
		value: COLORS.Lettre,
		icon: <ColorSwatch color={ COLORS.Lettre } />,
	},
	{
		label: 'Black',
		value: COLORS.Black,
		icon: <ColorSwatch color={ COLORS.Black } />,
	},
	{
		label: 'Luminous vivid orange',
		value: COLORS.LuminousVividOrange,
		icon: <ColorSwatch color={ COLORS.LuminousVividOrange } />,
	},
	{
		label: 'Vivid purple',
		value: COLORS.VividPurple,
		icon: <ColorSwatch color={ COLORS.VividPurple } />,
	},
	{
		label: 'Custom',
		value: 'custom',
		icon: <Icon icon={ color } width={ 22 } height={ 22 } />,
	},
];

const AccentColorControl = ( { accentColor, setAccentColor }: AccentColorControlProps ) => {
	const { __, hasTranslation } = useI18n();
	const locale = useLocale();
	const [ customColor, setCustomColor ] = useState< AccentColor | null >( null );
	const [ colorPickerOpen, setColorPickerOpen ] = useState< boolean >( false );
	const accentColorRef = useRef< HTMLInputElement >( null );
	const { shouldLimitGlobalStyles } = usePremiumGlobalStyles();

	const handlePredefinedColorSelect = ( { value }: { value: string } ) => {
		if ( value === 'custom' ) {
			/**
			 * Color picker is opened with the current accentColor selected by default
			 * Color picker can be closed with escape, or by clicking outside, without making any explicit choice
			 * In that case the previously selected accentColor value will now be selected as "Custom"
			 */
			setCustomColor( accentColor );
			setColorPickerOpen( true );
			return;
		}
		// New pre-defined color was selected
		// Therefore clear custom color if one was set
		customColor && setCustomColor( null );

		// When color picker is open and user opens the select dropdown, the color picker remains open
		// Hence ensure the color picker is closed after predefined color selection
		setColorPickerOpen( false );

		setAccentColor( {
			hex: value,
			rgb: hexToRgb( value ),
		} );
	};

	const handleCustomColorSelect = ( { hex, rgb }: ColorPicker.OnChangeCompleteValue ) => {
		setCustomColor( { hex, rgb: rgb as unknown as RGB } );
		setAccentColor( { hex, rgb: rgb as unknown as RGB } );
	};

	return (
		<>
			<Popover
				isVisible={ colorPickerOpen }
				className="accent-color-control__popover"
				context={ accentColorRef.current }
				position="top left"
				onClose={ () => setColorPickerOpen( false ) }
			>
				{ /* add a form so pressing enter in the color input field will close the picker */ }
				<form
					onSubmit={ ( event ) => {
						event.preventDefault();
						event.stopPropagation();
						setColorPickerOpen( false );
					} }
				>
					<ColorPicker
						disableAlpha
						color={ accentColor.hex }
						onChangeComplete={ handleCustomColorSelect }
					/>
				</form>
			</Popover>
			<FormFieldset>
				<FormLabel htmlFor="accentColor">
					{ hasTranslation( 'Favorite color' ) || locale === 'en'
						? __( 'Favorite color' )
						: __( 'Accent color' ) }
					{ shouldLimitGlobalStyles && (
						<PremiumBadge
							className="accent-color-control__premium-badge"
							tooltipText={ __(
								'Upgrade to a paid plan for color changes to take effect and to unlock the advanced design customization'
							) }
						/>
					) }
				</FormLabel>

				<SelectDropdown
					ref={ accentColorRef }
					// @ts-expect-error SelectDropdown is defined in .jsx file and has no type definitions generated
					className="accent-color-control__accent-color-input"
					id="accentColor"
					onFocus={ () => setColorPickerOpen( true ) }
					value={ customColor ? 'custom' : accentColor.hex }
					onSelect={ handlePredefinedColorSelect }
					selectedIcon={ customColor && <ColorSwatch color={ customColor.hex } /> }
					options={ COLOR_OPTIONS }
					showSelectedOption={ !! customColor } // hide selected option with the exception of "Custom" option
				/>
			</FormFieldset>
			<div
				className={ classNames( 'accent-color-control__contrast-warning', {
					'is-visible': ! hasMinContrast( accentColor.rgb ),
				} ) }
				aria-hidden={ hasMinContrast( accentColor.rgb ) }
				role="alert"
			>
				<div className="accent-color-control__contrast-warning-icon-container">
					<Icon icon={ tip } size={ 20 } />
				</div>
				<div>
					{ __(
						'The accent color chosen may make your buttons and links illegible. Consider picking a darker color.'
					) }
				</div>
			</div>
		</>
	);
};

export default AccentColorControl;
