import { AnglePickerControl } from '@wordpress/components';
import React, { useState } from 'react';

const AnglePickerControlExample = () => {
	const [ angle, setAngle ] = useState();
	return <AnglePickerControl value={ angle } onChange={ setAngle } />;
};

export default AnglePickerControlExample;
