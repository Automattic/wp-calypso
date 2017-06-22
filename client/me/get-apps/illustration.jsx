/**
 * External dependencies
 */
import React from 'react';

const GetAppsIllustration = ( { translate } ) =>
	<div className={ 'get-apps__illustration' }>
		<img src={ '/calypso/images/illustrations/illustration-empty-results.svg' } />
		<h2>{ translate( 'Inspiration strikes any time, anywhere.' ) }</h2>
		<p>{ translate( 'Get WordPress apps for all your screens.' ) }</p>
	</div>;

export default GetAppsIllustration;
