/**
 * External dependencies
 */
import React from 'react';

import { Search } from './search';

export default { title: 'Search', component: Search };

const BoxedSearch = ( props ) => (
	<div style={ { position: 'relative', width: '270px', height: '50px' } }>
		<Search
			__={ ( str ) => str }
			placeholder="Search..."
			fitsContainer
			onSearch={ ( search ) => console.log( 'Searched: ', search ) } // eslint-disable-line no-console
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

export const WithOverlayStyling = () => {
	const overlayStyling = ( input ) => {
		const tokens = input.split( /(\s+)/ );

		return tokens
			.filter( ( token ) => token.trim() )
			.map( ( token, i ) => (
				<span style={ { borderBottom: '1px solid blue', fontSize: '0.9rem' } } key={ i }>
					{ token }
				</span>
			) );
	};

	return <BoxedSearch overlayStyling={ overlayStyling } />;
};
