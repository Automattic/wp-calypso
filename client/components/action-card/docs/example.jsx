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
				'This is some description of the header text, that ellaborates a bit a bout it and explaning about the action we are going to call to.'
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
