import { Card } from '@automattic/components';
import clsx from 'clsx';
import { forwardRef } from 'react';
import Search from 'calypso/components/search';

import './style.scss';

const SearchCard = ( { className, ...props }, ref ) => (
	<Card className={ clsx( 'search-card', className ) }>
		<Search ref={ ref } { ...props } />
	</Card>
);

export default forwardRef( SearchCard );
