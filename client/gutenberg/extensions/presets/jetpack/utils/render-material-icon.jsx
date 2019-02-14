/**
 * External dependencies
 */
import { Path, SVG } from '@wordpress/components';

const renderMaterialIcon = svg => (
	<SVG xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
		<Path fill="none" d="M0 0h24v24H0V0z" />
		{ svg }
	</SVG>
);

export default renderMaterialIcon;
