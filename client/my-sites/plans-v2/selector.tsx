/**
 * External dependencies
 */
import React, { useState } from 'react';
import { Button } from '@automattic/components';

/**
 * Internal dependencies
 */
import { SelectorPageProps } from './types';
import ProductsColumn from './products-column';
import { TERM_ANNUALLY, TERM_MONTHLY } from 'lib/plans/constants';

const SelectorPage = ( { defaultDuration = TERM_ANNUALLY }: SelectorPageProps ) => {
	const [ currentDuration, setDuration ] = useState( defaultDuration );
	const currentDurationString = currentDuration === TERM_ANNUALLY ? 'annual' : 'monthly';

	const toggleDuration = () =>
		setDuration( currentDuration === TERM_ANNUALLY ? TERM_MONTHLY : TERM_ANNUALLY );
	return (
		<div>
			<h1>Hello this is the Selector Page!</h1>
			<p>{ `You are currently looking at ${ currentDurationString } products` }</p>
			<Button onClick={ toggleDuration }>Toggle duration</Button>
			<ProductsColumn duration={ currentDuration } onProductClick={ () => null } />
		</div>
	);
};

export default SelectorPage;
