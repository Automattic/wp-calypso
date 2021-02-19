/**
 * External dependencies
 */
import { createContext } from 'react';
import { LineItemsState } from '../types';

const LineItemsContext = createContext< LineItemsState >( {
	items: [],
	total: {
		id: 'title',
		type: 'total',
		label: 'Total',
		amount: { currency: 'USD', value: 0, displayValue: '0' },
	},
} );

export default LineItemsContext;
