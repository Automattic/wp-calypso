/** @format */

/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import ActionCard from '../index';

ActionCard.displayName = 'ActionCard';

function ActionCardExample( props ) {
	return props.exampleCode;
}

ActionCardExample.displayName = 'ActionCard';

ActionCardExample.defaultProps = {
	exampleCode: (
		<ActionCard
			headerText="This is a header text"
			mainText="This is a description of the action. It gives a bit more detail and explains what we are inviting the user to do."
			buttonText="Call to action!"
			buttonIcon="external"
			buttonPrimary={ true }
			buttonHref="https://wordpress.com"
			buttonTarget="_blank"
			buttonOnClick={ null }
		/>
	),
};

export default ActionCardExample;
