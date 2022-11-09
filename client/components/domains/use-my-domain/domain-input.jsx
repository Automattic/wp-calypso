import { Card, Button, FormInputValidation, Gridicon } from '@automattic/components';
import { useLocale } from '@automattic/i18n-utils';
import { __, hasTranslation } from '@wordpress/i18n';
import { Icon } from '@wordpress/icons';
import PropTypes from 'prop-types';
import { useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import FormButton from 'calypso/components/forms/form-button';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormTextInput from 'calypso/components/forms/form-text-input';
import { bulb } from 'calypso/signup/icons';

import './style.scss';

function UseMyDomainInput( {
	baseClassName,
	domainName,
	isBusy,
	onChange,
	onClear,
	onNext,
	shouldSetFocus,
	validationError,
} ) {
	const domainNameInput = useRef( null );
	const locale = useLocale();

	useEffect( () => {
		shouldSetFocus && domainNameInput.current.focus();
	}, [ shouldSetFocus, domainNameInput ] );

	const keyDown = ( event ) => {
		if ( event.key === 'Enter' ) {
			! isBusy && onNext();
			return;
		}

		if ( event.key === 'Escape' ) {
			onClear();
			return;
		}

		if ( event.key === ' ' ) {
			return false;
		}
	};

	const hasDomainInputLabel =
		[ 'en', 'en-gb' ].includes( locale ) ||
		hasTranslation( 'Enter the domain you would like to use:' );
	const domainInputLabel = hasDomainInputLabel
		? __( 'Enter the domain you would like to use:' )
		: __( 'Enter your domain here' );

	const hasDomainInputNoteLabel =
		[ 'en', 'en-gb' ].includes( locale ) ||
		hasTranslation( 'Enter the domain you would like to use:' );
	const domainInputNote = hasDomainInputNoteLabel
		? __( 'This won’t affect your existing site.' )
		: '';
	return (
		<Card className={ baseClassName }>
			<div className={ baseClassName + '__domain-input' }>
				<label>{ domainInputLabel }</label>
				<FormFieldset className={ baseClassName + '__domain-input-fieldset' }>
					<FormTextInput
						/* translators: This is displayed as www.yoursiteaddress.com, where everything after www. is editable */
						placeholder={ __( 'yoursiteaddress.com' ) }
						value={ domainName }
						onChange={ onChange }
						onKeyDown={ keyDown }
						isError={ !! validationError }
						ref={ domainNameInput }
					/>
					{ domainName && (
						<Button
							className={ baseClassName + '__domain-input-clear' }
							borderless
							onClick={ onClear }
						>
							<Gridicon
								className={ baseClassName + '__domain-input-clear-icon' }
								icon="cross"
								size={ 12 }
							/>
						</Button>
					) }
					{ validationError && <FormInputValidation isError text={ validationError } icon="" /> }
				</FormFieldset>
				{ domainInputNote && (
					<p className={ baseClassName + '__domain-input-note' }>
						<Icon
							className={ baseClassName + '__domain-input-note-icon' }
							icon={ bulb }
							size={ 14 }
						/>
						{ domainInputNote }
					</p>
				) }
				<FormButton
					className={ baseClassName + '__domain-input-button' }
					primary
					busy={ isBusy }
					disabled={ isBusy }
					onClick={ onNext }
				>
					{ __( 'Continue' ) }
				</FormButton>
			</div>
		</Card>
	);
}

UseMyDomainInput.propTypes = {
	baseClassName: PropTypes.string.isRequired,
	domainName: PropTypes.string.isRequired,
	isBusy: PropTypes.bool,
	onChange: PropTypes.func.isRequired,
	onClear: PropTypes.func.isRequired,
	onNext: PropTypes.func.isRequired,
	shouldSetFocus: PropTypes.bool,
	validationError: PropTypes.node,
};

UseMyDomainInput.defaultProps = {
	isBusy: false,
	shouldSetFocus: false,
};

export default connect()( UseMyDomainInput );
