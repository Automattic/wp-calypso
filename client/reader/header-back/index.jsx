/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import HeaderCake from 'calypso/components/header-cake';

function goBack() {
	if ( typeof window !== 'undefined' ) {
		window.history.back();
	}
}

export default function HeaderBack() {
	return <HeaderCake isCompact={ false } onClick={ goBack } />;
}
