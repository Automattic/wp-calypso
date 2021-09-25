import { Card } from '@automattic/components';
import classnames from 'classnames';
import React from 'react';
import Search from 'calypso/components/search';

import './style.scss';

const SearchCard = ( { className, ...props }, ref ) => (
	<Card className={ classnames( 'search-card', className ) }>
		<Search ref={ ref } { ...props } />
	</Card>
);

export default React.forwardRef( SearchCard );
