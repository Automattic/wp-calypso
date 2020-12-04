/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import FormButton from 'calypso/components/forms/form-button';

const StepConfirmationButton = ( { disabled, onClick, children } ) => {
	return (
		<div className="step-confirmation-button">
			<FormButton type="button" onClick={ onClick } disabled={ Boolean( disabled ) } isPrimary>
				{ children }
			</FormButton>
		</div>
	);
};

StepConfirmationButton.propTypes = {
	disabled: PropTypes.bool,
	onClick: PropTypes.func.isRequired,
};

export default StepConfirmationButton;
