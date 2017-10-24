/** @format */
/**
 * External dependencies
 */
import React from 'react';

export default function makeTaggedMock( tag ) {
	return process.env.NODE_ENV === 'test' ? () => <div data-mock={ tag } /> : returnNull;
}

function returnNull() {
	return null;
}
