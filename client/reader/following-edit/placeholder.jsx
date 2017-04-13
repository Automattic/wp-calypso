/**
 * External Dependencies
 */
import React from 'react';

/**
 * Intenal Dependencies
 */

import Card from 'components/card';
import SiteIcon from 'blocks/site-icon';

export default class SubscriptionPlaceholder extends React.PureComponent {

	static displayName = 'SubscriptionPlaceholder'

	/* eslint-disable wpcalypso/jsx-classname-namespace */
	render() {
		return (
			<Card className="is-compact reader-list-item__card is-placeholder">
				<span className="reader-list-item__icon">
					<SiteIcon size={ 48 } />
				</span>
				<h2 className="reader-list-item__title"><span className="placeholder-text">Title</span></h2>
				<p className="reader-list-item__description"><span className="placeholder-text">URL</span></p>
			</Card>
			);
	}
}
