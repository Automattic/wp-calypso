/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import { Button } from '@automattic/components';

/**
 * Internal dependencies
 */
import './style.scss';

const DataLossWarning = ( { translate } ) => (
	<div className={ 'data-loss-warning' }>
		<h2>{ translate( 'Unsure of what all this means?' ) }</h2>
		<p>
			<strong>
				{ translate(
					"Mistakes when editing your website's files and database can lead to data loss."
				) }
			</strong>
			&nbsp;
			{ translate(
				'If you need help or have any questions our Happiness Engineers are here when you need them!'
			) }
		</p>
		<Button href={ '/help/contact/' }>{ translate( 'Contact us' ) }</Button>
	</div>
);

export default localize( DataLossWarning );
