/**
 * External dependencies
 */
import React from 'react';

export const cssChunkLink = asset => (
	<link key={ asset } rel="stylesheet" type="text/css" href={ asset } data-webpack />
);
