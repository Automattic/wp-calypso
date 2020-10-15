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
			onSearch={ ( search ) => console.log( 'Searched: ', search ) }
			{ ...props }
		/>
	</div>
);

export const _default = () => {
	return <BoxedSearch />;
};

export const Simple = () => {
	return <BoxedSearch hideClose hideOpenIcon compact />;
};

export const Delayed = () => {
	return <BoxedSearch delaySearch />;
};

export const Searching = () => {
	return <BoxedSearch searching initialValue="Kiwi" />;
};

export const Disabled = () => <BoxedSearch disabled isOpen />;

export const Pinned = () => <BoxedSearch pinned />;

export const Compact = () => <BoxedSearch compact />;

export const CompactPinned = () => <BoxedSearch pinned compact fitsContainer />;
