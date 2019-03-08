/**
 * External dependencies
 */
import React from 'react';
import { identity } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Gridicon from 'gridicons';

const SkipButton = ( { onClick, translate = identity } ) => (
	<div className="jetpack-connect__skip-button">
		<Button onClick={ onClick } borderless>
			{ translate( 'Skip' ) }
			<Gridicon icon="arrow-right" size={ 18 } />
		</Button>
	</div>
);

export default localize( SkipButton );
