/** @format */
import React from 'react';
import HeaderCake from 'client/components/header-cake';

function goBack() {
	if ( typeof window !== 'undefined' ) {
		window.history.back();
	}
}

export default function HeaderBack() {
	return <HeaderCake isCompact={ false } onClick={ goBack } />;
}
