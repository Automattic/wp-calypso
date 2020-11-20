/**
 * External dependencies
 */

import React, { PureComponent } from 'react';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import CardHeading from 'calypso/components/card-heading';

export default class CardHeadingExample extends PureComponent {
	static displayName = 'CardHeadingExample';

	render() {
		return (
			<Card>
				<CardHeading>This is a default CardHeading at 20px</CardHeading>
				<CardHeading tagName="h1" size={ 54 }>
					This is a CardHeading, H1 at 54px
				</CardHeading>
				<CardHeading tagName="h2" size={ 48 }>
					This is a CardHeading, H2 at 48px
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
				<CardHeading tagName="h6" isBold={ true } size={ 16 }>
					This is a CardHeading, H6 at 16px
				</CardHeading>
			</Card>
		);
	}
}
