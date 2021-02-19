/**
 * External dependencies
 */
import React, { useState } from 'react';

/**
 * WordPress dependencies
 */
import { ToggleControl } from '@wordpress/components';

/**
 * Internal dependencies
 */
import Disableable from 'calypso/components/disableable';

const DisableableExample = () => {
	const [ firstToggle, setFirstToggle ] = useState( true );
	const [ secondToggle, setSecondToggle ] = useState( true );

	return (
		<React.Fragment>
			<p>Form control, wrapped with a disabled Disableable component</p>
			<Disableable disabled>
				<ToggleControl
					label="Click me"
					onChange={ () => setFirstToggle( ! firstToggle ) }
					checked={ firstToggle }
				/>
			</Disableable>

			<p>Form control, wrapped with a non-disabled Disableable component</p>
			<Disableable disabled={ false }>
				<ToggleControl
					label="Click me"
					onChange={ () => setSecondToggle( ! secondToggle ) }
					checked={ secondToggle }
				/>
			</Disableable>
		</React.Fragment>
	);
};

DisableableExample.displayName = 'Disableable';

export default DisableableExample;
