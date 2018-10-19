/**
 * External dependencies
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
 * Internal dependencies
 */

import Chart from './component.js';

/**
 * Module variables
 */

class ChartEdit extends Component {
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
					<Chart foo={ foo } />
				</div>
			</Fragment>
		);
	}
}

export default ChartEdit;
