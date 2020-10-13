/**
 * External dependencies
 */
import React from 'react';

import Search from '.';

export default { title: 'Search', component: Search };

const BoxedSearch = ( props ) => (
	<div style={ { position: 'relative', width: '270px', height: '50px' } }>
		<Search
			placeholder="Search..."
			autoFocus
			fitsContainer
			onSearch={ () => console.log( 'searched!' ) }
			{ ...props }
		/>
	</div>
);

export const _default = () => {
	return <BoxedSearch />;
};

export const Disabled = () => <BoxedSearch disabled isOpen />;

export const Pinned = () => <BoxedSearch pinned />;

export const Compact = () => <Search compact />;

export const CompactPinned = () => (
	<div style={ { position: 'relative', width: '270px', height: '36px' } }>
		<Search pinned compact fitsContainer />
	</div>
);
