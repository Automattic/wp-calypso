/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';

function ReactionButton( props ) {
	return (
		<button
			onClick={ props.onButtonClick }>
			<span className="jp-reactions__button">{ props.icon }</span>{
				props.label
			}
		</button>
	);
}

ReactionButton.propTypes = {
	icon: PropTypes.string, // or object
	onButtonClick: PropTypes.func.isRequired,
};

export default ReactionButton;
