import { PureComponent } from 'react';
import Rating from 'calypso/components/rating';

export default class RatingExample extends PureComponent {
	static displayName = 'Rating';

	render() {
		return <Rating rating={ 70 } size={ 48 } />;
	}
}
