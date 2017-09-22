/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Rating from 'components/rating';

export default class RatingExample extends React.PureComponent {
	render() {
		return (
			<Rating rating={ 70 } size={ 48 } />
		);
	}
}
