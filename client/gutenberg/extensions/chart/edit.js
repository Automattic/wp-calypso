/**
 * External dependencies
 */

import { __ } from '@wordpress/i18n';
import {
	Component,
	Fragment,
} from '@wordpress/element';
import {
	TextControl,
	SelectControl,
} from '@wordpress/components';
import {
	InspectorControls,
	BlockAlignmentToolbar,
	BlockControls,
} from '@wordpress/editor';

/**
 * Internal dependencies
 */

import { settings } from './settings.js';
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
			attributes,
			className,
			setAttributes,
		} = this.props;
		const {
			align,
			chart_type,
			googlesheet_url,
			number_format,
			x_axis_label,
			y_axis_label,
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
						label={ __( "Google Sheets URL" ) }
				        value={ googlesheet_url }
				        onChange={ ( value ) => setAttributes( { googlesheet_url: value } ) }
					/>
					<SelectControl
						label={ __( "Chart type") }
						value={ chart_type }
						options={ settings.chart_typeOptions }
						onChange={ ( value ) => setAttributes( { chart_type: value } ) }
					/>
					<TextControl
						label={ __( "X Axis Label" ) }
						placeholder={ __( "Type a label…" ) }
				        value={ x_axis_label }
				        onChange={ ( value ) => setAttributes( { x_axis_label: value } ) }
					/>
					<TextControl
						label={ __( "Y Axis Label" ) }
						placeholder={ __( "Type a label…" ) }
				        value={ y_axis_label }
				        onChange={ ( value ) => setAttributes( { y_axis_label: value } ) }
					/>
					<SelectControl
						label={ __( "Number format") }
						value={ number_format }
						options={ settings.number_formatOptions }
						onChange={ ( value ) => setAttributes( { number_format: value } ) }
					/>
				</InspectorControls>
				<div className={ className }>
					<Chart
						chart_type={ chart_type }
						googlesheet_url={ googlesheet_url }
						number_format={ number_format }
						x_axis_label={ x_axis_label }
						y_axis_label={ y_axis_label }
					 />
				</div>
			</Fragment>
		);
	}
}

export default ChartEdit;
