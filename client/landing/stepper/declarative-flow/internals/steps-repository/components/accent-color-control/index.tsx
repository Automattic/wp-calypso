/* eslint-disable wpcalypso/jsx-classname-namespace */
import { Gridicon, Popover } from '@automattic/components';
import { useLocale } from '@automattic/i18n-utils';
import { hasMinContrast, hexToRgb, RGB } from '@automattic/onboarding';
import { ColorPicker } from '@wordpress/components';
import { Icon, color } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import classNames from 'classnames';
import {
	Dispatch,
	ReactElement,
	SetStateAction,
	useCallback,
	useEffect,
	useState,
	useRef,
} from 'react';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import SelectDropdown from 'calypso/components/select-dropdown';
import { tip } from 'calypso/signup/icons';
import { usePremiumGlobalStyles } from 'calypso/state/sites/hooks/use-premium-global-styles';
import './style.scss';
import ColorSwatch from './color-swatch';

interface AccentColorControlProps {
	accentColor: AccentColor;
	setAccentColor: Dispatch< SetStateAction< AccentColor > >;
}

interface ColorOption {
	label: string;
	value: string;
	icon: ReactElement;
	isPremium: boolean;
}

export type AccentColor = {
	hex: string;
	rgb: RGB;
	default?: boolean;
};

enum COLORS {
	Lettre = '#113AF5',
	Black = '#000000',
	VividRed = '#CF2E2E',
	VividPurple = '#9B51E0',
}

const AccentColorControl = ( { accentColor, setAccentColor }: AccentColorControlProps ) => {
	const { __, hasTranslation } = useI18n();
	const locale = useLocale();
	const [ customColor, setCustomColor ] = useState< AccentColor | null >( null );
	const [ colorPickerOpen, setColorPickerOpen ] = useState< boolean >( false );
	const accentColorRef = useRef< HTMLInputElement >( null );
	const { shouldLimitGlobalStyles } = usePremiumGlobalStyles();

	const getColorOptions = useCallback(
		(): ColorOption[] => [
			{
				label: 'Lettre',
				value: COLORS.Lettre,
				icon: <ColorSwatch color={ COLORS.Lettre } />,
				isPremium: false,
			},
			{
				label: 'Black',
				value: COLORS.Black,
				icon: <ColorSwatch color={ COLORS.Black } />,
				isPremium: shouldLimitGlobalStyles,
			},
			{
				label: 'Vivid red',
				value: COLORS.VividRed,
				icon: <ColorSwatch color={ COLORS.VividRed } />,
				isPremium: shouldLimitGlobalStyles,
			},
			{
				label: 'Vivid purple',
				value: COLORS.VividPurple,
				icon: <ColorSwatch color={ COLORS.VividPurple } />,
				isPremium: shouldLimitGlobalStyles,
			},
			{
				label: 'Custom',
				value: 'custom',
				icon: <Icon className="custom_color_icon" icon={ color } width={ 22 } height={ 22 } />,
				isPremium: shouldLimitGlobalStyles,
			},
		],
		[ shouldLimitGlobalStyles ]
	);

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

	const getMatchingOption = useCallback(
		() => getColorOptions().find( ( option ) => option.value === accentColor.hex ) || null,
		[ accentColor.hex, getColorOptions ]
	);

	const getSelectedText = () => getMatchingOption()?.label || 'Custom';

	const getSelectedIcon = () =>
		customColor ? <ColorSwatch color={ customColor.hex } /> : getMatchingOption()?.icon;

	const getSelectedExtra = () => {
		if ( ! shouldLimitGlobalStyles ) {
			return null;
		}

		const matchingOption = getMatchingOption();

		if ( matchingOption?.isPremium || ( customColor && ! matchingOption ) ) {
			return <Gridicon icon="lock" size={ 18 } color="gray" className="extra-gridicon" />;
		}
		return null;
	};

	const getDropdownOption = ( option: ColorOption ) => {
		return (
			<SelectDropdown.Item
				key={ option.label }
				icon={ option.icon }
				onClick={ () => handlePredefinedColorSelect( { value: option.value } ) }
				selected={ option.value === accentColor.hex }
				extra={
					shouldLimitGlobalStyles && option.isPremium ? (
						<Gridicon icon="lock" size={ 18 } color="gray" className="extra-gridicon" />
					) : null
				}
			>
				{ option.label }
			</SelectDropdown.Item>
		);
	};

	const getDropdownOptions = () => {
		if ( ! shouldLimitGlobalStyles ) {
			return getColorOptions().map( ( option ) => getDropdownOption( option ) );
		}

		const freeColors = getColorOptions().filter( ( { isPremium } ) => ! isPremium );
		const premiumColors = getColorOptions().filter( ( { isPremium } ) => isPremium );

		const dropdownOptions = [
			...freeColors.map( ( freeColor ) => getDropdownOption( freeColor ) ),
			<SelectDropdown.Label key="dropdown-label">
				{ __( 'Unlock more colors with a Premium plan' ) }
			</SelectDropdown.Label>,
			...premiumColors.map( ( premiumColor ) => getDropdownOption( premiumColor ) ),
		];

		return dropdownOptions;
	};

	useEffect( () => {
		// In later stages of some flows, color for site is already set when this control loads.
		// If so, and if site color doesn't match a prest option, set customColor to true.
		if ( ! getMatchingOption() ) {
			setCustomColor( {
				hex: accentColor.hex,
				rgb: hexToRgb( accentColor.hex ),
			} );
		}
	}, [ accentColor, getMatchingOption ] );

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
				</FormLabel>
				<SelectDropdown
					// @ts-expect-error SelectDropdown is defined in .jsx file and has no type definitions generated
					ref={ accentColorRef }
					className="accent-color-control__accent-color-input"
					id="accentColor"
					onFocus={ () => setColorPickerOpen( true ) }
					value={ customColor ? 'custom' : accentColor.hex }
					showSelectedOption={ !! customColor } // hide selected option with the exception of "Custom" option
					selectedText={ getSelectedText() }
					selectedIcon={ getSelectedIcon() }
					selectedExtra={ getSelectedExtra() }
				>
					{ getDropdownOptions() }
				</SelectDropdown>
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
