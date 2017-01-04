import React from 'react';

export const LinkBlock = ( { url, children } ) =>
	<a href={ url }>{ children }</a>;

export default LinkBlock;
