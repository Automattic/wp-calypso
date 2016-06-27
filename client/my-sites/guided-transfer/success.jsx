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
import CompactCard from 'components/card/compact';
import Gridicon from 'components/gridicon';
import HappinessSupport from 'components/happiness-support';

const GuidedTransferSuccess = ( { translate, siteURL } ) =>
	<div>
		<div className="guided-transfer__success-hero-banner">
			<Gridicon icon="trophy" size={ 64 } className="guided-transfer__success-hero-icon" />
			<h1>{ translate( 'Thank you for your purchase!' ) }</h1>
			<p>
				{ translate(
					'The guided transfer for {{strong}}%s{{/strong}} will begin very soon. ' +
					'We will be in touch with you via email.',
					{
						args: [ siteURL ],
						components: {
							strong: <strong />,
						}
					}
				) }
			</p>
		</div>
		<Card>
			<Card>
				<h1>{ translate( 'When will it be ready?' ) }</h1>
				<p>
					{ translate(
						'A Guided Transfer occurs over a 24 hour period. A Happiness Engineer ' +
						'will work with you to set up a day (during the work week) to perform ' +
						'the transfer.'
					) }
				</p>
				<Button
					primary={ true }
					href="//en.support.wordpress.com/guided-transfer"
				>
					{ translate( 'Learn more about Guided Transfers' ) }
				</Button>
				<Gridicon icon="time" size={ 48 } className="guided-transfer__success-time-icon" />
			</Card>
		</Card>
		<Card>
			<HappinessSupport />
		</Card>
	</div>;

export default localize( GuidedTransferSuccess );