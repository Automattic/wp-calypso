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
		isEnabled: PropTypes.bool.isRequired,
		shouldShowPlaceholders: PropTypes.bool.isRequired,
	},

	getDefaultProps() {
		return {
			menus: []
		};
	},

	render() {
		const placeholderMap = ( menu, menuIndex ) => (
			<div key={ menuIndex } className="exporter__placeholder-text">
				{ this.translate( 'Loading options…' ) }
			</div>
		)

		const selectMap = ( menu, menuIndex ) => (
			<Select key={ menuIndex } disabled={ ! this.props.isEnabled }>
				{ menu.options.map( ( option, optionIndex ) => (
					<option value={ optionIndex } key={ optionIndex }>{ option }</option>
				) ) }
			</Select>
		)

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
					{ this.props.menus.map(
						this.props.shouldShowPlaceholders ? placeholderMap : selectMap
					) }
				</div>

			</div>
		);
	}
} );
