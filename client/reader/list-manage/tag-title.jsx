/**
 * External dependencies
 */
import React from 'react';

function TagTitle( { tag: { display_name, slug } } ) {
	return <>{ display_name || slug }</>;
}

export default TagTitle;
