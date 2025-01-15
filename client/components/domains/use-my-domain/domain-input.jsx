import { Card, Button, FormInputValidation, Gridicon } from '@automattic/components';
import { __ } from '@wordpress/i18n';
import { Icon } from '@wordpress/icons';
import PropTypes from 'prop-types';
import { useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import illustration from 'calypso/assets/images/domains/domain.svg';
import FormButton from 'calypso/components/forms/form-button';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormTextInput from 'calypso/components/forms/form-text-input';
import { bulb } from 'calypso/signup/icons';

import './style.scss';

function UseMyDomainInput( {
	baseClassName,
	domainName,
	isBusy,
	isSignupStep,
	onChange,
	onClear,
	onNext,
	shouldSetFocus,
	validationError,
} ) {
	const domainNameInput = useRef( null );

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

	return (
		<Card className={ baseClassName }>
			{ ! isSignupStep && (
				<div className={ baseClassName + '__domain-illustration' }>
					<img src={ illustration } alt="" width={ 160 } />
				</div>
			) }
			<div className={ baseClassName + '__domain-input' }>
				<label>{ __( 'Enter the domain you would like to use:' ) }</label>
				<FormFieldset className={ baseClassName + '__domain-input-fieldset' }>
					<FormTextInput
						placeholder={ __( 'yourgroovydomain.com' ) }
						value={ domainName }
						onChange={ onChange }
						onKeyDown={ keyDown }
						isError={ !! validationError }
						ref={ domainNameInput }
						autoCapitalize="none"
						autoCorrect="off"
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

				<p className={ baseClassName + '__domain-input-note' }>
					<Icon
						className={ baseClassName + '__domain-input-note-icon' }
						icon={ bulb }
						size={ 14 }
					/>
					{ __( 'This won’t affect your existing site.' ) }
				</p>

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
	isSignupStep: PropTypes.bool,
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
