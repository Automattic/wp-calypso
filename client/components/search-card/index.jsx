/**
 * External dependencies
 */

import React from 'react';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import Search from 'calypso/components/search';

/**
 * Style dependencies
 */
import './style.scss';

const SearchCard = ( { className, ...props }, ref ) => (
	<Card className={ classnames( 'search-card', className ) }>
		<Search ref={ ref } { ...props } />
	</Card>
);

export default React.forwardRef( SearchCard );
