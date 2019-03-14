/**
 * External dependencies
 */
import { InnerBlocks } from '@wordpress/editor';

export default ( { className } ) => {
	return (
		<div className={ className }>
			<InnerBlocks.Content />
		</div>
	);
};
