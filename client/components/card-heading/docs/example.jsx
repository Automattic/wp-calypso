/**
 * External dependencies
 */

import React, { PureComponent } from 'react';

/**
 * Internal dependencies
 */
import Card from '@automattic/components/card';
import CardHeading from 'components/card-heading';

export default class CardHeadingExample extends PureComponent {
	static displayName = 'CardHeadingExample';

	render() {
		return (
			<Card>
				<CardHeading>This is a default CardHeading</CardHeading>
				<CardHeading tagName="h1" size={ 54 }>
					This is a CardHeading, H1 at 54px
				</CardHeading>
				<CardHeading tagName="h2" size={ 47 }>
					This is a CardHeading, H2 at 47px
				</CardHeading>
				<CardHeading tagName="h3" size={ 36 }>
					This is a CardHeading, H3 at 36px
				</CardHeading>
				<CardHeading tagName="h4" size={ 32 }>
					This is a CardHeading, H4 at 32px
				</CardHeading>
				<CardHeading tagName="h5" size={ 24 }>
					This is a CardHeading, H5 at 24px
				</CardHeading>
				<CardHeading tagName="h6" size={ 21 }>
					This is a CardHeading, H6 at 21px
				</CardHeading>
			</Card>
		);
	}
}
