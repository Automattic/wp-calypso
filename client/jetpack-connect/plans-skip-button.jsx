/** @format */
/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import React from 'react';

/**
 * Internal dependencies
 */
import Button from 'components/button';

const PlansSkipButton = ( { onClick, translate } ) => (
	<div className="jetpack-connect__plans-nav-buttons">
		<Button onClick={ onClick } compact borderless>
			{ translate( 'Skip' ) }
		</Button>
	</div>
);

export default localize( PlansSkipButton );
