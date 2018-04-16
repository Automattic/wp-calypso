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
	'\n\t\t\theaderText="This is a header text"' +
	'\n\t\t\tmainText="This is a description of the action. It gives a bit more detail and explains what we are inviting the user to do."' +
	'\n\t\t\tbuttonText="Call to action!"' +
	'\n\t\t\tbuttonIcon="external"' +
	'\n\t\t\tbuttonPrimary={ true }' +
	'\n\t\t\tbuttonHref="https://wordpress.com"' +
	'\n\t\t\tbuttonTarget="_blank"' +
	'\n\t\t\tbuttonOnClick={ null }' +
	'\n\t\t/>';

function ActionCardExample( props ) {
	console.log( actionCardCode );
	return <ComponentPlayground code={ actionCardCode } scope={ { ActionCard } } />;
}

ActionCardExample.propTypes = {
	translate: PropTypes.func.isRequired,
};

ActionCardExample.displayName = 'ActionCard';

export default ActionCardExample;
