/**
 * External dependencies
 */
import * as React from 'react';

/**
 * Style dependencies
 */
import './style.scss';

interface Props {
	primaryButton?: React.ReactElement;
	secondaryButton?: React.ReactElement;
}

const ActionButtons: React.FunctionComponent< Props > = ( { primaryButton, secondaryButton } ) => (
	<div className="action-buttons">
		<div>{ secondaryButton }</div>
		<div>{ primaryButton }</div>
	</div>
);

export default ActionButtons;
