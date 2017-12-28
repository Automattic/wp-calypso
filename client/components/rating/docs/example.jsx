/** @format */

/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import Rating from 'client/components/rating';

export default class RatingExample extends React.PureComponent {
	static displayName = 'Rating';

	render() {
		return <Rating rating={ 70 } size={ 48 } />;
	}
}
