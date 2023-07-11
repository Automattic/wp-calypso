/* eslint-disable wpcalypso/jsx-classname-namespace */
import { Popover } from '@automattic/components';
import { hasMinContrast, hexToRgb, RGB } from '@automattic/onboarding';
import { ColorPicker } from '@wordpress/components';
import { Icon, color, lock } from '@wordpress/icons';
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
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { tip } from 'calypso/signup/icons';
import { useSiteGlobalStylesStatus } from 'calypso/state/sites/hooks/use-site-global-styles-status';
import { useSite } from '../../../../../hooks/use-site';
import './style.scss';
import ColorSwatch from './color-swatch';

type ColorPickerColor = Exclude< React.ComponentProps< typeof ColorPicker >[ 'color' ], undefined >;

interface AccentColorControlProps {
	accentColor: AccentColor;
	setAccentColor: Dispatch< SetStateAction< AccentColor > >;
	labelText?: string;
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
	AllegroBlue = '#113AF5',
	Black = '#000000',
	VividRed = '#CF2E2E',
	VividPurple = '#9B51E0',
}

const AccentColorControl = ( {
	accentColor,
	setAccentColor,
	labelText,
}: AccentColorControlProps ) => {
	const { __ } = useI18n();
	const [ customColor, setCustomColor ] = useState< AccentColor | null >( null );
	const [ colorPickerOpen, setColorPickerOpen ] = useState< boolean >( false );
	const accentColorRef = useRef< HTMLInputElement >( null );
	const site = useSite();
	const { shouldLimitGlobalStyles, globalStylesInPersonalPlan } = useSiteGlobalStylesStatus(
		site?.ID
	);

	const getColorOptions = useCallback(
		(): ColorOption[] => [
			{
				label: __( 'Allegro Blue' ),
				value: COLORS.AllegroBlue,
				icon: <ColorSwatch color={ COLORS.AllegroBlue } />,
				isPremium: false,
			},
			{
				label: __( 'Black' ),
				value: COLORS.Black,
				icon: <ColorSwatch color={ COLORS.Black } />,
				isPremium: shouldLimitGlobalStyles,
			},
			{
				label: __( 'Vivid red' ),
				value: COLORS.VividRed,
				icon: <ColorSwatch color={ COLORS.VividRed } />,
				isPremium: shouldLimitGlobalStyles,
			},
			{
				label: __( 'Vivid purple' ),
				value: COLORS.VividPurple,
				icon: <ColorSwatch color={ COLORS.VividPurple } />,
				isPremium: shouldLimitGlobalStyles,
			},
			{
				label: __( 'Custom' ),
				value: 'custom',
				icon: <Icon className="custom_color_icon" icon={ color } width={ 22 } height={ 22 } />,
				isPremium: shouldLimitGlobalStyles,
			},
		],
		[ shouldLimitGlobalStyles ]
	);

	const isCustomColorPremium = useCallback( () => {
		return !! getColorOptions().find( ( { value } ) => value === 'custom' )?.isPremium;
	}, [ getColorOptions ] );

	const handlePredefinedColorSelect = ( {
		value,
		isPremium,
	}: {
		value: string;
		isPremium: boolean;
	} ) => {
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

		recordTracksEvent( 'calypso_signup_accent_color_select', {
			color: value,
			is_premium: isPremium,
		} );

		setAccentColor( {
			hex: value,
			rgb: hexToRgb( value ),
		} );
	};

	const handleCustomColorSelect = ( color: ColorPickerColor ) => {
		if ( typeof color === 'string' ) {
			return;
		}
		const { hex, rgb } = color;
		recordTracksEvent( 'calypso_signup_accent_color_select', {
			color: 'custom',
			is_premium: isCustomColorPremium(),
		} );

		setCustomColor( { hex, rgb } );
		setAccentColor( { hex, rgb } );
	};

	const getMatchingOption = useCallback(
		() => getColorOptions().find( ( option ) => option.value === accentColor.hex ) || null,
		[ accentColor.hex, getColorOptions ]
	);

	const getSelectedText = () => getMatchingOption()?.label || 'Custom';

	const getSelectedIcon = () =>
		customColor ? <ColorSwatch color={ customColor.hex } /> : getMatchingOption()?.icon;

	const getSelectedSecondaryIcon = () => {
		if ( ! shouldLimitGlobalStyles ) {
			return null;
		}

		const matchingOption = getMatchingOption();

		if ( matchingOption?.isPremium || ( customColor && ! matchingOption ) ) {
			return (
				<Icon
					icon={ lock }
					size={ 18 }
					className={ classNames( 'extra-gridicon', 'right-positioned' ) }
				/>
			);
		}
		return null;
	};

	const getDropdownOption = ( option: ColorOption ) => {
		return (
			<SelectDropdown.Item
				key={ option.label }
				icon={ option.icon }
				onClick={ () =>
					handlePredefinedColorSelect( { value: option.value, isPremium: option.isPremium } )
				}
				selected={ option.value === accentColor.hex }
				secondaryIcon={
					shouldLimitGlobalStyles && option.isPremium ? (
						<Icon icon={ lock } size={ 18 } className="extra-gridicon" />
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
		const planText = globalStylesInPersonalPlan
			? __( 'Unlock more colors with a Personal plan' )
			: __( 'Unlock more colors with a Premium plan' );

		const dropdownOptions = [
			...freeColors.map( ( freeColor ) => getDropdownOption( freeColor ) ),
			<SelectDropdown.Label key="dropdown-label">{ planText }</SelectDropdown.Label>,
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
				<FormLabel htmlFor="accentColor">{ labelText ?? __( 'Favorite color' ) }</FormLabel>
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
					selectedSecondaryIcon={ getSelectedSecondaryIcon() }
					positionSelectedSecondaryIconOnRight={ true }
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
