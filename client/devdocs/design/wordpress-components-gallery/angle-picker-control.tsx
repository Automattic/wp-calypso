import { AnglePickerControl } from '@wordpress/components';
import { useState } from 'react';

const AnglePickerControlExample = () => {
	const [ angle, setAngle ] = useState( 0 );
	return <AnglePickerControl value={ angle } onChange={ setAngle } />;
};

export default AnglePickerControlExample;
