/**
 * External dependencies
 */
var React = require( 'react' ),
	classNames = require( 'classnames' ),
	isEmpty = require( 'lodash/lang/isEmpty' ),
	observe = require( 'lib/mixins/data-observe' );

/**
 * Internal dependencies
 */
var analytics = require( 'analytics' ),
	FocusMixin = require( './focus-mixin.js' ),
	FormLabel = require( 'components/forms/form-label' ),
	FormSelect = require( 'components/forms/form-select' ),
	Input = require( './input' );

module.exports = React.createClass( {
	displayName: 'StateSelect',

	mixins: [ FocusMixin(), observe( 'statesList' ) ],

	recordStateSelectClick: function() {
		if ( this.props.eventFormName ) {
			analytics.ga.recordEvent( 'Upgrades', `Clicked ${ this.props.eventFormName } State Select` );
		}
	},

	render: function() {
		var classes = classNames( this.props.additionalClasses, 'state', {
				focus: this.state.focus,
				invalid: this.props.invalid
			} ),
			statesList = this.props.statesList.getByCountry( this.props.countryCode ),
			options = [];

		if ( isEmpty( statesList ) ) {
			return (
				<Input { ...this.props } />
			);
		} else {
			options.push( { key: '', label: this.translate( 'Select State' ), disabled: 'disabled' } );

			options = options.concat( statesList.map( function( state ) {
				if ( isEmpty( state.code ) ) {
					return { key: '--', label: '', disabled: 'disabled' };
				} else {
					return { key: state.code, label: state.name };
				}
			} ) );

			return (
				<div className={ classes }>
					<div>
						<FormLabel htmlFor={ this.props.name }>{ this.props.label }</FormLabel>
						<FormSelect
							name={ this.props.name }
							value={ this.props.value }
							disabled={ this.props.disabled }
							onBlur={ this.handleBlur }
							onChange={ this.props.onChange }
							onClick={ this.recordStateSelectClick }
							onFocus={ this.handleFocus } >
						{ options.map( function( option ) {
							return <option key={ option.key } value={ option.key } disabled={ option.disabled }>{ option.label }</option>;
						} ) }
						</FormSelect>
					</div>
				</div>
			);
		}
	}
} );
