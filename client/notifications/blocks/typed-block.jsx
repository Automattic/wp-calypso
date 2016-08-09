import React from 'react';

export const TypedBlock = ( { children, type } ) =>
	<span className={ `text-range typed type-${ type }` }>{ children }</span>;

export default TypedBlock;
