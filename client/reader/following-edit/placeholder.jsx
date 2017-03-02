/**
 * External dependencies
 */
import React from 'react';

import Card from 'components/card';
import SiteIcon from 'blocks/site-icon';

export default React.createClass( {

	displayName: 'SubscriptionPlaceholder',

	render: function() {
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
} );
