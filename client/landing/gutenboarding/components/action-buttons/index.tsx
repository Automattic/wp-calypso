/**
 * External dependencies
 */
import * as React from 'react';

interface Props {
	primaryButton?: React.ReactElement;
	secondaryButton?: React.ReactElement;
}

const ActionButtons: React.FunctionComponent< Props > = ( { primaryButton, secondaryButton } ) => (
	<div className="action-buttons">
		{ primaryButton } { secondaryButton }
	</div>
);

export default ActionButtons;
