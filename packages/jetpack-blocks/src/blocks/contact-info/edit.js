/**
 * External dependencies
 */
import { InnerBlocks } from '@wordpress/editor';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
const ALLOWED_BLOCKS = [
	'jetpack/markdown',
	'jetpack/address',
	'jetpack/email',
	'jetpack/phone',
	'jetpack/map',
	'jetpack/business-hours',
	'core/paragraph',
	'core/image',
	'core/heading',
	'core/gallery',
	'core/list',
	'core/quote',
	'core/shortcode',
	'core/audio',
	'core/code',
	'core/cover',
	'core/html',
	'core/separator',
	'core/spacer',
	'core/subhead',
	'core/video',
];

const TEMPLATE = [ [ 'jetpack/email' ], [ 'jetpack/phone' ], [ 'jetpack/address' ] ];

const ContactInfoEdit = props => {
	const { isSelected } = props;

	return (
		<div
			className={ classnames( {
				'jetpack-contact-info-block': true,
				'is-selected': isSelected,
			} ) }
		>
			<InnerBlocks allowedBlocks={ ALLOWED_BLOCKS } templateLock={ false } template={ TEMPLATE } />
		</div>
	);
};

export default ContactInfoEdit;
