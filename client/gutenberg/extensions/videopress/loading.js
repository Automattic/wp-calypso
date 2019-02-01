/** @format */

/**
 * External dependencies
 */
import { Placeholder, Spinner } from '@wordpress/components';

const Loading = ( { text } ) => (
	<Placeholder>
		<Spinner />
		{ text }
	</Placeholder>
);

export default Loading;
