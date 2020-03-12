/**
 * External dependencies
 */
import * as React from 'react';
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { STORE_KEY } from '../../stores/onboard';

const Preview: React.FunctionComponent = () => {
	const { selectedDesign } = useSelect( select => select( STORE_KEY ).getState() );
	return <div>Preview to be implemented. You picked { selectedDesign ?? 'unknown' }.</div>;
};

export default Preview;
