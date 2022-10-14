/* eslint-disable wpcalypso/jsx-classname-namespace */
import { isEnabled } from '@automattic/calypso-config';
import { Popover } from '@automattic/components';
import { useLocale } from '@automattic/i18n-utils';
import { hasMinContrast, RGB } from '@automattic/onboarding';
import { ColorPicker } from '@wordpress/components';
import { Icon } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import classNames from 'classnames';
import { Dispatch, SetStateAction, useState, useRef } from 'react';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormInput from 'calypso/components/forms/form-text-input';
import PremiumBadge from 'calypso/components/premium-badge';
import { tip } from 'calypso/signup/icons';

import './style.scss';

interface AccentColorControlProps {
	accentColor: AccentColor;
	setAccentColor: Dispatch< SetStateAction< AccentColor > >;
}

export type AccentColor = {
	hex: string;
	rgb: RGB;
	default?: boolean;
};

/**
 * Generates an inline SVG for the color picker swatch
 *
 * @param color the color in HEX
 * @returns a value for background-image
 */
function generateSwatchSVG( color: string | undefined ) {
	return `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Ccircle cx='12' cy='12' r='10' stroke='%23000' stroke-opacity='0.2' stroke-width='1' fill='${ encodeURIComponent(
		color || '#fff'
	) }'%3E%3C/circle%3E${
		// render a line when a color isn't selected
		! color
			? `%3Cline x1='18' y1='4' x2='7' y2='20' stroke='%23ccc' stroke-width='1'%3E%3C/line%3E`
			: ''
	}%3C/svg%3E")`;
}

const AccentColorControl = ( { accentColor, setAccentColor }: AccentColorControlProps ) => {
	const { __, hasTranslation } = useI18n();
	const locale = useLocale();
	const [ colorPickerOpen, setColorPickerOpen ] = useState< boolean >( false );
	const accentColorRef = useRef< HTMLInputElement >( null );

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
						onChangeComplete={ ( { hex, rgb } ) =>
							setAccentColor( { hex, rgb: rgb as unknown as RGB } )
						}
					/>
				</form>
			</Popover>
			<FormFieldset>
				<FormLabel htmlFor="accentColor">
					{ hasTranslation( 'Favorite color' ) || locale === 'en'
						? __( 'Favorite color' )
						: __( 'Accent color' ) }
					{ isEnabled( 'limit-global-styles' ) && (
						<PremiumBadge
							tooltipText={ __(
								'Upgrade to a paid plan for color changes to take effect and to unlock the advanced design customization'
							) }
						/>
					) }
				</FormLabel>
				<FormInput
					inputRef={ accentColorRef }
					className="accent-color-control__accent-color-input"
					style={ {
						backgroundImage: generateSwatchSVG( accentColor.hex ),
						...( accentColor.default && { color: 'var( --studio-gray-30 )' } ),
					} }
					name="accentColor"
					id="accentColor"
					onFocus={ () => setColorPickerOpen( true ) }
					readOnly
					value={ accentColor.hex }
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
