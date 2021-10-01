import { CheckboxControl } from '@wordpress/components';
import { useState } from 'react';

const CheckboxControlExample = () => {
	const [ isChecked, setChecked ] = useState( false );

	return (
		<CheckboxControl
			label="Example Checkbox Control"
			checked={ isChecked }
			onChange={ setChecked }
		/>
	);
};

export default CheckboxControlExample;
