import { FormLabel } from '@automattic/components';
import { FormToggle } from '@wordpress/components';
import { useState } from 'react';

const FormToggleExample = () => {
	const [ isChecked, setChecked ] = useState( true );

	return (
		<FormLabel>
			<FormToggle
				checked={ isChecked }
				onChange={ () => {
					setChecked( ! isChecked );
				} }
			/>
			<span>
				This example mixes Calypso components with WordPress components by using Calypso's FormLabel
				to wrap Gutenberg's FormToggle
			</span>
		</FormLabel>
	);
};

export default FormToggleExample;
