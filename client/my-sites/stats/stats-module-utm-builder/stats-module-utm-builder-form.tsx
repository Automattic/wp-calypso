import { FormLabel } from '@automattic/components';
import { Icon, check } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import React, { useEffect, useRef, useState } from 'react';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormTextInput from 'calypso/components/forms/form-text-input';
import StatsButton from '../components/stats-button';

import './style.scss';

type InputFieldProps = {
	id: string;
	label: string;
	name: string;
	placeholder: string;
	value: string;
	onChange: ( e: React.ChangeEvent< HTMLInputElement > ) => void;
	labelReference?: React.RefObject< HTMLLabelElement >;
	ariaDescribedBy?: string;
};

const utmKeys = [ 'url', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term' ];

type UtmKeyType = ( typeof utmKeys )[ number ];

type inputValuesType = Record< UtmKeyType, string >;
type formLabelsType = Record<
	UtmKeyType,
	{ label: string; placeholder: string; describedBy?: string }
>;

const useConfirmationMessage = ( visibleDuration = 2000, fadeOutDuration = 500 ) => {
	const [ showConfirmation, setShowConfirmation ] = useState( false );
	const [ fadeOut, setFadeOut ] = useState( false );
	const timeoutRef = useRef< NodeJS.Timeout | null >( null );

	useEffect( () => {
		return () => {
			if ( timeoutRef.current ) {
				clearTimeout( timeoutRef.current );
			}
		};
	}, [] );

	const triggerConfirmation = () => {
		if ( timeoutRef.current ) {
			clearTimeout( timeoutRef.current );
		}

		setFadeOut( false );
		setShowConfirmation( true );

		timeoutRef.current = setTimeout( () => {
			setFadeOut( true );

			timeoutRef.current = setTimeout( () => {
				setShowConfirmation( false );
			}, fadeOutDuration );
		}, visibleDuration );
	};

	return { showConfirmation, fadeOut, triggerConfirmation };
};

const CopyConfirmation = ( { show, fadeOut }: { show: boolean; fadeOut: boolean } ) => {
	const translate = useTranslate();

	return (
		show && (
			<div
				className={ clsx( 'stats-utm-builder__copy-confirmation', {
					'fade-out': fadeOut,
				} ) }
			>
				<Icon size={ 24 } icon={ check } />
				{ translate( 'Copied' ) }
			</div>
		)
	);
};

const InputField: React.FC< InputFieldProps > = ( {
	id,
	label,
	name,
	placeholder,
	value,
	onChange,
	labelReference,
	ariaDescribedBy,
} ) => {
	return (
		<div className="stats-utm-builder__form-field">
			<FormLabel htmlFor={ id } id={ `${ id }-label` } ref={ labelReference }>
				{ label }
			</FormLabel>
			<FormTextInput
				type="text"
				id={ id }
				name={ name }
				value={ value }
				onChange={ onChange }
				placeholder={ placeholder }
				aria-describedby={ ariaDescribedBy }
				aria-labelledby={ `${ id }-label` }
			/>
		</div>
	);
};

const UtmBuilder: React.FC = () => {
	const translate = useTranslate();
	const [ url, setUrl ] = useState( '' );
	const [ inputValues, setInputValues ] = useState< inputValuesType >( {
		utm_source: '',
		utm_medium: '',
		utm_campaign: '',
	} );
	// Focus the initial input field when rendered.
	const initialFieldReference = useRef< HTMLLabelElement >( null );
	const { showConfirmation, fadeOut, triggerConfirmation } = useConfirmationMessage();

	useEffect( () => {
		setTimeout( () => {
			initialFieldReference.current!.focus();
		}, 100 );
	}, [] );

	const fromLabels: formLabelsType = {
		url: {
			label: translate( 'Site or post URL' ),
			placeholder: '',
			describedBy: 'stats-utm-builder-help-section-url',
		},
		utm_source: {
			label: translate( 'UTM source' ),
			placeholder: translate( 'e.g. newsletter' ),
			describedBy: 'stats-utm-builder-help-section-campaign-source',
		},
		utm_medium: {
			label: translate( 'UTM medium' ),
			placeholder: translate( 'e.g. email, social' ),
			describedBy: 'stats-utm-builder-help-section-campaign-medium',
		},
		utm_campaign: {
			label: translate( 'UTM campaign' ),
			placeholder: translate( 'e.g. promotion' ),
			describedBy: 'stats-utm-builder-help-section-campaign-name',
		},
	};

	const handleInputChange = ( e: React.ChangeEvent< HTMLInputElement > ) => {
		const { name, value } = e.target;
		setInputValues( ( prevValues ) => ( {
			...prevValues,
			[ name ]: value,
		} ) );
	};

	const handleSubmit = ( e: React.FormEvent ) => {
		// Prevent submittin the form
		e.preventDefault();
	};

	const campaignString = Object.entries( inputValues )
		.map( ( [ key, value ] ) => ( value ? `${ key }=${ encodeURIComponent( value ) }` : '' ) )
		.filter( ( value ) => value.length )
		.join( '&' );

	const utmString = ! url
		? translate( 'Fill out campaign parameters to see the URL' )
		: `${ url }${
				campaignString ? `${ url.includes( '?' ) ? '&' : '?' }${ campaignString }` : ''
		  }`;

	const handleCopy = () => {
		if ( url ) {
			navigator.clipboard.writeText( utmString );
			triggerConfirmation();
		}
	};

	return (
		<>
			<form onSubmit={ handleSubmit }>
				<FormFieldset className="stats-utm-builder__form-fieldset">
					<InputField
						id="url"
						name="url"
						label={ fromLabels.url.label }
						placeholder={ fromLabels.url.placeholder }
						value={ url }
						onChange={ ( e ) => setUrl( e.target.value ) }
						ariaDescribedBy={ fromLabels.url.describedBy }
						labelReference={ initialFieldReference }
					/>
					{ Object.keys( inputValues ).map( ( key ) => (
						<InputField
							key={ key }
							id={ key }
							name={ key }
							label={ fromLabels[ key ].label }
							placeholder={ fromLabels[ key ].placeholder }
							value={ inputValues[ key ] }
							onChange={ handleInputChange }
							ariaDescribedBy={ fromLabels[ key ].describedBy }
						/>
					) ) }
				</FormFieldset>
			</form>

			<div>
				<div className="stats-utm-builder__label">{ translate( 'Your URL to share' ) }</div>
				<div className="stats-utm-builder__url">{ utmString }</div>
			</div>
			<div className="stats-utm-builder__copy-area">
				<StatsButton
					className="stats-utm-builder__copy-button"
					primary
					onClick={ handleCopy }
					disabled={ ! url }
				>
					{ translate( 'Copy to clipboard' ) }
				</StatsButton>
				<CopyConfirmation show={ showConfirmation } fadeOut={ fadeOut } />
			</div>
		</>
	);
};

export default UtmBuilder;
