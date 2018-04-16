/** @format */

/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import ActionCard from '../index';
import ComponentPlayground from 'devdocs/design/component-playground';

export const actionCardCode =
	'<ActionCard' +
	'\n\theaderText="This is a header text"' +
	'\n\tmainText="This is a description of the action. It gives a bit more detail and explains what we are inviting the user to do."' +
	'\n\tbuttonText="Call to action!"' +
	'\n\tbuttonIcon="external"' +
	'\n\tbuttonPrimary={ true }' +
	'\n\tbuttonHref="https://wordpress.com"' +
	'\n\tbuttonTarget="_blank"' +
	'\n\tbuttonOnClick={ null }' +
	'\n/>';

function ActionCardExample( props ) {
	return (
		<ComponentPlayground
			code={ actionCardCode }
			scope={ { ActionCard } }
			showCode={ props.showCode }
		/>
	);
}

ActionCardExample.propTypes = {
	translate: PropTypes.func.isRequired,
};

ActionCardExample.displayName = 'ActionCard';

export default ActionCardExample;
