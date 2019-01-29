/** @format */
/**
 * External dependencies
 */
import classNames from 'classnames';
import { InnerBlocks } from '@wordpress/editor';

export default ( { className, attributes } ) => {
	return (
		<div
			className={ classNames( className, 'wp-block-jetpack-visited-before-threshold' ) }
			data-criteria={ attributes.criteria }
			data-threshold={ attributes.threshold }
		>
			<InnerBlocks.Content />
		</div>
	);
};
