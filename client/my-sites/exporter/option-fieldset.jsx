/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import PureRenderMixin from 'react-pure-render/mixin';

/**
 * Internal dependencies
 */
import FormRadio from 'components/forms/form-radio';
import Select from 'components/forms/form-select';
import Label from 'components/forms/form-label';

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
		onSelect: PropTypes.func,

		legend: PropTypes.string.isRequired,
		isEnabled: PropTypes.bool.isRequired
	},

	getDefaultProps() {
		return {
			menus: []
		};
	},

	renderMenu( menu, key ) {
		if ( this.props.isLoadingOptions ) {
			return (
				<div key={ key } className="exporter__placeholder-text">
					Loading options...
				</div>
			);
		}

		return (
			<Select
				key={ key }
				disabled={ !this.props.isEnabled }
				onChange={ menu.onChange }
			>
				<option value={ 0 } key="defaultOption">{ menu.defaultLabel }</option>
				{ menu.options.map( ( option ) => (
					<option value={ option.value } key={ option.value }>{ option.label }</option>
				) ) }
			</Select>
		);
	},

	render() {
		return (
			<div className="exporter__option-fieldset">

				<Label className="exporter__option-fieldset-legend">
					<FormRadio
						checked={ this.props.isEnabled }
						onChange={ this.props.onSelect }/>
					<span className="exporter__option-fieldset-legend-text">{ this.props.legend }</span>
				</Label>

				{ this.props.description &&
					<p className="exporter__option-fieldset-description">
						{ this.props.description }
					</p>
				}

				<div className="exporter__option-fieldset-fields">
					{ this.props.menus.map( ( menu, menuIndex ) => {
						return this.renderMenu( menu, menuIndex );
					} ) }
				</div>

			</div>
		);
	}
} );
