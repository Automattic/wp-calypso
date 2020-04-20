/**
 * External dependencies
 */
import React from 'react';
import { SVG, Path } from '@wordpress/components';

const Arrow: React.FunctionComponent< React.SVGProps< SVGSVGElement > > = ( props ) => (
	<SVG
		{ ...props }
		width="26"
		height="18"
		viewBox="0 0 26 18"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
	>
		<Path d="M16 1L24 9M24 9L16 17M24 9H0" stroke="currentColor" strokeWidth="2" />
	</SVG>
);

export default Arrow;
