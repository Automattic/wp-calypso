/**
 * External dependencies
 */
import { Spinner } from '@wordpress/components';

const Loading = ( { text } ) => (
	<div className="wp-block-embed is-loading">
		<Spinner />
		<p>{ text }</p>
	</div>
);

export default Loading;
