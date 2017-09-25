/**
 * External dependencies
 */
import PropTypes from 'prop-types';

import React from 'react';

import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';

export default localize( React.createClass( {
	displayName: 'SharingButtonsStyle',

	propTypes: {
		onChange: PropTypes.func,
		value: PropTypes.string,
		disabled: PropTypes.bool
	},

	getDefaultProps: function() {
		return {
			onChange: function() {},
			disabled: false
		};
	},

	onChange: function( value ) {
		this.props.onChange( value );
		analytics.ga.recordEvent( 'Sharing', 'Clicked Button Style Radio Button', value );
	},

	getOptions: function() {
		return [
			{ value: 'icon-text', label: this.props.translate( 'Icon & Text', { context: 'Sharing: Sharing button option label' } ) },
			{ value: 'icon', label: this.props.translate( 'Icon Only', { context: 'Sharing: Sharing button option label' } ) },
			{ value: 'text', label: this.props.translate( 'Text Only', { context: 'Sharing: Sharing button option label' } ) },
			{ value: 'official', label: this.props.translate( 'Official Buttons', { context: 'Sharing: Sharing button option label' } ) }
		].map( function( option ) {
			return (
				<label key={ option.value }>
					<input name="sharing_button_style" type="radio" checked={ option.value === this.props.value } onChange={ this.onChange.bind( null, option.value ) } disabled={ this.props.disabled } />
					{ option.label }
				</label>
			);
		}, this );
	},

	render: function() {
		return (
		    <fieldset className="sharing-buttons__fieldset">
				<legend className="sharing-buttons__fieldset-heading">{ this.props.translate( 'Button style', { context: 'Sharing: Sharing button option heading' } ) }</legend>
				{ this.getOptions() }
			</fieldset>
		);
	}
} ) );
