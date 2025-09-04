import clsx from 'clsx';
import { forwardRef } from 'react';
import Search from 'calypso/components/search';

import './style.scss';

const SearchCard = ( { className, ...props }, ref ) => (
	<div className={ clsx( 'search-card', className ) }>
		<Search ref={ ref } { ...props } />
	</div>
);

export default forwardRef( SearchCard );
