/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import Gridicon from 'components/gridicon';
import supportUrls from 'lib/url/support';

const GuidedTransferInProgress = ( { translate } ) =>
	<Card className="guided-transfer-card__in-progress">
		<div className="guided-transfer-card__in-progress-icon">
			<Gridicon icon="time" size={ 48 } />
		</div>
		<h1 className="guided-transfer-card__in-progress-title">
			{ translate( 'Your site is being prepared for transfer' ) }
		</h1>
		<p>
		{ translate(
			'A Guided Transfer occurs over a 24 hour period. A Happiness Engineer ' +
			'will work with you to set up a day to perform the transfer.'
		) }
		</p>
		<Button href={ supportUrls.GUIDED_TRANSFER }>
			{ translate( 'Learn more about Guided Transfers' ) }
		</Button>
	</Card>;

export default localize( GuidedTransferInProgress );
