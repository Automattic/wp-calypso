import { Button, FormInputValidation, Popover } from '@automattic/components';
import {
	hasMinContrast,
	hexToRgb,
	StepContainer,
	RGB,
	base64ImageToBlob,
} from '@automattic/onboarding';
import { ColorPicker } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { createInterpolateElement } from '@wordpress/element';
import { Icon } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import React, { FormEvent, useEffect } from 'react';
import greenCheckmarkImg from 'calypso/assets/images/onboarding/green-checkmark.svg';
import { ForwardedAutoresizingFormTextarea } from 'calypso/blocks/comments/autoresizing-form-textarea';
import FormattedHeader from 'calypso/components/formatted-header';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormInput from 'calypso/components/forms/form-text-input';
import { SiteIconWithPicker } from 'calypso/components/site-icon-with-picker';
import { useSiteSlugParam } from 'calypso/landing/stepper/hooks/use-site-slug-param';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { tip } from 'calypso/signup/icons';
import { useSite } from '../../../../hooks/use-site';
import type { Step } from '../../types';
import './style.scss';

type AccentColor = {
	hex: string;
	rgb: RGB;
	default?: boolean;
};

const defaultAccentColor = {
	hex: '#0675C4',
	rgb: { r: 6, g: 117, b: 196 },
	default: true,
};

/**
 * Generates an inline SVG for the color picker swatch
 *
 * @param color the color in HEX
 * @returns a value for background-image
 */
function generateSwatchSVG( color: string | undefined ) {
	return `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Ccircle cx='12' cy='12' r='10' stroke='%23ccc' stroke-width='1' fill='${ encodeURIComponent(
		color || '#fff'
	) }'%3E%3C/circle%3E${
		// render a line when a color isn't selected
		! color
			? `%3Cline x1='18' y1='4' x2='7' y2='20' stroke='%23ccc' stroke-width='1'%3E%3C/line%3E`
			: ''
	}%3C/svg%3E")`;
}

const NewsletterSetup: Step = ( { navigation } ) => {
	const { submit } = navigation;
	const { __ } = useI18n();
	const accentColorRef = React.useRef< HTMLInputElement >( null );

	const site = useSite();
	const usesSite = !! useSiteSlugParam();

	const { setSiteTitle, setSiteAccentColor, setSiteDescription, setSiteLogo } =
		useDispatch( ONBOARD_STORE );

	const [ invalidSiteTitle, setInvalidSiteTitle ] = React.useState( false );
	const [ colorPickerOpen, setColorPickerOpen ] = React.useState( false );
	const [ siteTitle, setComponentSiteTitle ] = React.useState( '' );
	const [ tagline, setTagline ] = React.useState( '' );
	const [ accentColor, setAccentColor ] = React.useState< AccentColor >( defaultAccentColor );
	const [ base64Image, setBase64Image ] = React.useState< string | null >();
	const [ selectedFile, setSelectedFile ] = React.useState< File | undefined >();
	const state = useSelect( ( select ) => select( ONBOARD_STORE ) ).getState();

	useEffect( () => {
		const { siteAccentColor, siteTitle, siteDescription, siteLogo } = state;
		if ( siteAccentColor && siteAccentColor !== '' && siteAccentColor !== defaultAccentColor.hex ) {
			setAccentColor( { hex: siteAccentColor, rgb: hexToRgb( siteAccentColor ) } );
		} else {
			setAccentColor( defaultAccentColor );
		}

		setTagline( siteDescription );
		setComponentSiteTitle( siteTitle );
		if ( siteLogo ) {
			const file = new File( [ base64ImageToBlob( siteLogo ) ], 'site-logo.png' );
			setSelectedFile( file );
		}
	}, [ state ] );

	useEffect( () => {
		if ( ! site ) {
			return;
		}

		setComponentSiteTitle( site.name || '' );
		setTagline( site.description );
	}, [ site ] );

	useEffect( () => {
		if ( siteTitle.trim().length && invalidSiteTitle ) {
			setInvalidSiteTitle( false );
		}
	}, [ siteTitle, invalidSiteTitle ] );

	const imageFileToBase64 = ( file: Blob ) => {
		const reader = new FileReader();
		reader.readAsDataURL( file );
		reader.onload = () => setBase64Image( reader.result as string );
		reader.onerror = () => setBase64Image( null );
	};

	const onSubmit = async ( event: FormEvent ) => {
		event.preventDefault();
		setInvalidSiteTitle( ! siteTitle.trim().length );

		setSiteDescription( tagline );
		setSiteTitle( siteTitle );
		setSiteAccentColor( accentColor.hex );

		if ( selectedFile && base64Image ) {
			try {
				setSiteLogo( base64Image );
			} catch ( _error ) {
				// communicate the error to the user
			}
		}

		if ( siteTitle.trim().length ) {
			submit?.( { siteTitle, tagline, siteAccentColor: accentColor.hex } );
		}
	};

	const onChange = ( event: React.FormEvent< HTMLInputElement > ) => {
		switch ( event.currentTarget.name ) {
			case 'siteTitle':
				return setComponentSiteTitle( event.currentTarget.value );
			case 'tagline':
				return setTagline( event.currentTarget.value );
		}
	};

	const getBackgroundImage = ( fieldValue: string | undefined ) => {
		return fieldValue && fieldValue.trim() ? `url( ${ greenCheckmarkImg } )` : '';
	};

	const stepContent = (
		<form className="newsletter-setup__form" onSubmit={ onSubmit }>
			<SiteIconWithPicker
				site={ site }
				disabled={ usesSite ? ! site : false }
				onSelect={ ( file ) => {
					setSelectedFile( file );
					imageFileToBase64( file );
				} }
				selectedFile={ selectedFile }
			/>
			<Popover
				isVisible={ colorPickerOpen }
				className="newsletter-setup__accent-color-popover"
				context={ accentColorRef.current }
				position="top left"
				onClose={ () => setColorPickerOpen( false ) }
			>
				<ColorPicker
					disableAlpha
					color={ accentColor.hex }
					onChangeComplete={ ( { hex, rgb } ) =>
						setAccentColor( { hex, rgb: rgb as unknown as RGB } )
					}
				/>
			</Popover>
			<FormFieldset>
				<FormLabel htmlFor="siteTitle">{ __( 'Site name' ) }</FormLabel>
				<FormInput
					value={ siteTitle }
					placeholder={ __( 'My newsletter' ) }
					name="siteTitle"
					id="siteTitle"
					style={ {
						backgroundImage: getBackgroundImage( siteTitle ),
					} }
					isError={ invalidSiteTitle }
					onChange={ onChange }
				/>
				{ invalidSiteTitle && (
					<FormInputValidation
						isError
						text={ __( `Oops. Looks like your Newsletter doesn't have a name yet.` ) }
					/>
				) }
			</FormFieldset>
			<FormFieldset>
				<FormLabel htmlFor="tagline">{ __( 'Brief description' ) }</FormLabel>
				<ForwardedAutoresizingFormTextarea
					name="tagline"
					id="tagline"
					value={ tagline }
					placeholder={ __( 'Describe your Newsletter in a line or two' ) }
					enableAutoFocus={ false }
					onChange={ onChange }
					style={ {
						backgroundImage: getBackgroundImage( tagline ),
						backgroundRepeat: 'no-repeat',
						backgroundPosition: '95%',
						paddingRight: ' 40px',
						paddingLeft: '14px',
					} }
				/>
			</FormFieldset>
			<FormFieldset>
				<FormLabel htmlFor="accentColor">{ __( 'Accent Color' ) }</FormLabel>
				<FormInput
					inputRef={ accentColorRef }
					className="newsletter-setup__accent-color"
					style={ {
						backgroundImage: [
							generateSwatchSVG( accentColor.hex ),
							...( ! accentColor.default ? [ getBackgroundImage( accentColor.hex ) ] : [] ),
						].join( ', ' ),
						...( accentColor.default && { color: 'var( --studio-gray-30 )' } ),
					} }
					name="accentColor"
					id="accentColor"
					onFocus={ () => setColorPickerOpen( ! colorPickerOpen ) }
					readOnly
					value={ accentColor.hex }
				/>
			</FormFieldset>
			{ ! hasMinContrast( accentColor.rgb ) && (
				<div className="newsletter-setup__contrast-warning" style={ { display: 'flex' } }>
					<div className="newsletter-setup__contrast-warning-icon-container">
						<Icon icon={ tip } size={ 20 } />
					</div>
					<div>
						{ __(
							'The accent color chosen may make your buttons and links illegible. Consider picking a darker color.'
						) }
					</div>
				</div>
			) }
			<Button className="newsletter-setup__submit-button" type="submit" primary>
				{ __( 'Continue' ) }
			</Button>
		</form>
	);

	return (
		<StepContainer
			stepName={ 'newsletter-setup' }
			isWideLayout={ true }
			hideBack={ true }
			flowName={ 'newsletter' }
			formattedHeader={
				<FormattedHeader
					id={ 'newsletter-setup-header' }
					headerText={ createInterpolateElement( __( 'Personalize your<br />Newsletter' ), {
						br: <br />,
					} ) }
					align={ 'center' }
				/>
			}
			stepContent={ stepContent }
			recordTracksEvent={ recordTracksEvent }
			showJetpackPowered
		/>
	);
};

export default NewsletterSetup;
