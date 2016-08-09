import React from 'react';

export const TypedBlock = ( { children, type } ) =>
	<span className={ `note-range__typed type-${ type }` }>{ children }</span>;

export default TypedBlock;
