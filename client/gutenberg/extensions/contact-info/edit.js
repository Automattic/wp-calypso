/** @format */

/**
 * External dependencies
 */
import { Component } from '@wordpress/element';
import { InnerBlocks } from '@wordpress/editor';

/**
 * Internal dependencies
 */
const ALLOWED_BLOCKS = [
	'jetpack/markdown',
	'jetpack/address',
	'jetpack/email',
	'jetpack/phone',
	'jetpack/map',
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
	'core/columns',
	'core/column',
];

const TEMPLATE = [ [ 'jetpack/address' ], [ 'jetpack/email' ], [ 'jetpack/phone' ] ];

class ContactInfoEdit extends Component {
	constructor( ...args ) {
		super( ...args );
	}

	render() {
		const {
			attributes: {},
			isSelected,
		} = this.props;
		return (
			<div
				className={
					isSelected ? 'jetpack-contact-info-block is-selected' : 'jetpack-contact-info-block'
				}
			>
				<InnerBlocks
					allowedBlocks={ ALLOWED_BLOCKS }
					templateLock={ false }
					template={ TEMPLATE }
				/>
			</div>
		);
	}
}

export default ContactInfoEdit;
