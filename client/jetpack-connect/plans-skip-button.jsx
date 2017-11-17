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

const PlansSkipButton = ( { onClick, isRtl, translate } ) => (
	<div className="jetpack-connect__plans-nav-buttons">
		<Button onClick={ onClick }>
			{ translate( 'Start with free' ) }
			<Gridicon icon={ isRtl ? 'arrow-left' : 'arrow-right' } size={ 18 } />
		</Button>
	</div>
);

export default localize( PlansSkipButton );
