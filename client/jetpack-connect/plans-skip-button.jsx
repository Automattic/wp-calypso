/** @format */
/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Gridicon from 'gridicons';

const PlansSkipButton = ( { onClick, translate } ) => (
	<div className="jetpack-connect__plans-nav-buttons">
		<Button onClick={ onClick }>
			{ translate( 'Start with free' ) }
			<Gridicon icon="arrow-right" />
		</Button>
	</div>
);

export default localize( PlansSkipButton );
