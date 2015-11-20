/**
 * External dependencies
 */
import React, { PropTypes } from 'react';

/**
 * Internal dependencies
 */
import Checkbox from 'components/forms/form-checkbox';
import Select from 'components/forms/form-select';
import Label from 'components/forms/form-label';

const PureRenderMixin = React.addons.PureRenderMixin;

/**
 * Displays a list of select menus with a checkbox legend
 *
 * Displays a field group with a checkbox legend and optionally
 * a list of select menus, or a description to appear beneath the
 * legend.
 */
module.exports = React.createClass( {
	displayName: 'OptionFieldset',

	mixins: [ PureRenderMixin ],

	propTypes: {
		onToggleEnabled: PropTypes.func,

		legend: PropTypes.string.isRequired,
		isEnabled: PropTypes.bool.isRequired
	},

	getDefaultProps() {
		return {
			menus: []
		};
	},

	render() {
		return (
			<div className="exporter__option-fieldset">

				<Label className="exporter__option-fieldset-legend">
					<Checkbox
						checked={ this.props.isEnabled }
						onChange={ this.props.onToggleEnabled }/>
					<span className="exporter__option-fieldset-legend-text">{ this.props.legend }</span>
				</Label>

				{ this.props.description &&
					<p className="exporter__option-fieldset-description">
						{ this.props.description }
					</p>
				}

				<div className="exporter__option-fieldset-fields">
					{ this.props.menus.map( ( menu, menuIndex ) => (
						<Select key={ menuIndex } disabled={ !this.props.isEnabled }>
							{ menu.options.map( ( option, optionIndex ) => (
								<option value={ optionIndex } key={ optionIndex }>{ option }</option>
							) ) }
						</Select>
					) ) }
				</div>

			</div>
		);
	}
} );
