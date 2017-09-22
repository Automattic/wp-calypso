/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import FormButton from 'components/forms/form-button';
import FormButtonsBar from 'components/forms/form-buttons-bar';

const ActionButtons = ( { buttons, className } ) => {
	return (
		<FormButtonsBar className={ className }>
			{ buttons.map( ( button, idx ) => (
				<FormButton
					type="button"
					key={ idx }
					disabled={ button.isDisabled }
					onClick={ button.onClick }
					isPrimary={ Boolean( button.isPrimary ) }>
					{ button.label }
				</FormButton>
			) ) }
		</FormButtonsBar>
	);
};

ActionButtons.propTypes = {
	buttons: PropTypes.arrayOf(
		PropTypes.shape( {
			label: PropTypes.node.isRequired,
			onClick: PropTypes.func.isRequired,
			isPrimary: PropTypes.bool,
			isDisabled: PropTypes.bool,
		} )
	).isRequired,
	className: PropTypes.string,
};

export default ActionButtons;
