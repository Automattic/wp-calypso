/** @format */

/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import ActionCard from '../index';

function ActionCardExample( props ) {
	return (
		<ActionCard
			headerText={ 'This is a header text' }
			mainText={
				'This is a description of the action. It gives a bit more detail and explains what we are inviting the user to do.'
			}
			buttonText={ 'Call to action!' }
			buttonIcon="external"
			buttonPrimary={ true }
			buttonHref="https://wordpress.com"
			buttonTarget="_blank"
			buttonOnClick={ noop }
		/>
	);
}

ActionCardExample.propTypes = {
	translate: PropTypes.func.isRequired,
};

ActionCardExample.displayName = 'ActionCard';

export default ActionCardExample;
