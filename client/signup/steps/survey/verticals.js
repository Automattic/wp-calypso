/**
 * External dependencies
 */

import { shuffle } from 'lodash';
import { translate } from 'i18n-calypso';

const verticals = [
	{ value: 'a8c.14.7', label: () => translate( 'Wedding' ) },
	{ value: 'a8c.20', label: () => translate( 'Travel' ) },
	{ value: 'a8c.1.6', label: () => translate( 'Music' ) },
	{ value: 'a8c.8', label: () => translate( 'Food / Drink' ) },
	{ value: 'a8c.9.23', label: () => translate( 'Photography' ) },
	{ value: 'a8c.3', label: () => translate( 'Professional Services' ) },
	{ value: 'a8c.6', label: () => translate( 'Family / Parenting' ) },
	{ value: 'a8c.19', label: () => translate( 'Technology' ) },
	{ value: 'a8c.0.1', label: () => translate( 'Personal / Random Thoughts' ) },
	{ value: 'a8c.1', label: () => translate( 'Art' ) },
	{ value: 'a8c.5', label: () => translate( 'Education' ) },
	{ value: 'a8c.18', label: () => translate( 'Fashion / Beauty' ) },
	{ value: 'a8c.0.2', label: () => translate( 'Lifestyle / Inspiration' ) },
	{ value: 'a8c.7', label: () => translate( 'Health / Wellness' ) },
	{ value: 'a8c.23', label: () => translate( 'Religion / Spirituality' ) },
	{ value: 'a8c.17', label: () => translate( 'Sports / Recreation' ) },
	{ value: 'a8c.11', label: () => translate( 'Government / Politics' ) },
];

let shuffledVerticals = null;

export default {
	get() {
		if ( shuffledVerticals ) {
			return shuffledVerticals;
		}
		return ( shuffledVerticals = shuffle( verticals ) );
	},
};
