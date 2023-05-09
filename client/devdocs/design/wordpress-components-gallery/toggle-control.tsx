import { ToggleControl } from '@wordpress/components';
import { useState } from 'react';

const ToggleControlExample = () => {
	const [ hasFixedBackground, setHasFixedBackground ] = useState( true );
	return (
		<ToggleControl
			label="Does this have a fixed background?"
			help={ hasFixedBackground ? 'Has fixed background' : 'No fixed background' }
			checked={ hasFixedBackground }
			onChange={ setHasFixedBackground }
		/>
	);
};

export default ToggleControlExample;
