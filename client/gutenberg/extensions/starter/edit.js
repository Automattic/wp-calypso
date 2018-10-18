/**
 * Wordpress dependencies
 */

import {
	Component,
	Fragment
} from '@wordpress/element';
import { TextControl } from '@wordpress/components';
import {
	InspectorControls,
	BlockAlignmentToolbar,
	BlockControls,
} from '@wordpress/editor';

/**
 * External dependencies
 */

/**
 * Internal dependencies
 */

import Starter from './component.js';

/**
 * Module variables
 */

class StarterEdit extends Component {
	constructor() {
		super( ...arguments );
	}
	render() {
		const {
			className,
			setAttributes,
			attributes
		} = this.props;
		const {
			foo,
			align
		} = attributes;
		return (
			<Fragment>
				<BlockControls>
					<BlockAlignmentToolbar
						value={ align }
						onChange={ ( value ) => setAttributes( { align: value } ) }
					/>
				</BlockControls>
				<InspectorControls>
					<TextControl
						label="Foo"
				        value={ foo }
				        onChange={ ( value ) => setAttributes( { foo: value } ) }
					/>
				</InspectorControls>
				<div className={ className }>
					<Starter foo={ foo } />
				</div>
			</Fragment>
		);
	}
}

export default StarterEdit;
