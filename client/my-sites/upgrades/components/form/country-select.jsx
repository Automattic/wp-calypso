/**
 * External dependencies
 */
var React = require( 'react' ),
	classNames = require( 'classnames' ),
	isEmpty = require( 'lodash/isEmpty' ),
	ReactDom = require( 'react-dom' ),
	observe = require( 'lib/mixins/data-observe' );

/**
 * Internal dependencies
 */
var analytics = require( 'analytics' ),
	FocusMixin = require( './focus-mixin.js' ),
	FormLabel = require( 'components/forms/form-label' ),
	FormInputValidation = require( 'components/forms/form-input-validation' ),
	scrollIntoViewport = require( 'lib/scroll-into-viewport' ),
	FormSelect = require( 'components/forms/form-select' );

module.exports = React.createClass( {
	displayName: 'CountrySelect',

	mixins: [ FocusMixin( 'input' ), observe( 'countriesList' ) ],

	recordCountrySelectClick() {
		if ( this.props.eventFormName ) {
			analytics.ga.recordEvent( 'Upgrades', `Clicked ${ this.props.eventFormName } Country Select` );
		}
	},

	focus() {
		var node = ReactDom.findDOMNode( this.refs.input );
		node.focus();
		scrollIntoViewport( node );
	},

	render() {
		var classes = classNames( this.props.additionalClasses, 'country', {
				focus: this.state.focus,
				invalid: this.props.invalid
			} ),
			countriesList = this.props.countriesList.get(),
			options = [],
			value = this.props.value;

		if ( isEmpty( countriesList ) ) {
			options.push( { key: 'loading', label: this.translate( 'Loading…' ), disabled: 'disabled' } );

			value = '';
		} else {
			options = options.concat( [
				{ key: 'select-country', label: this.translate( 'Select Country' ) },
				{ key: 'divider1', label: '', disabled: 'disabled' }
			] );

			options = options.concat( countriesList.map( function( country ) {
				if ( isEmpty( country.code ) ) {
					return { key: 'divider2', label: '', disabled: 'disabled' };
				} else {
					return { key: country.code, label: country.name, value: country.code };
				}
			} ) );
		}

		return (
			<div className={ classes }>
				<div>
					<FormLabel htmlFor={ this.props.name }>{ this.props.label }</FormLabel>
					<FormSelect
						name={ this.props.name }
						value={ value }
						disabled={ this.props.disabled }
						ref="input"
						onBlur={ this.handleBlur }
						onChange={ this.props.onChange }
						onClick={ this.recordCountrySelectClick }
						onFocus={ this.handleFocus } >
						{ options.map( function( option ) {
							return <option key={ option.key } value={ option.value || '' } disabled={ option.disabled }>{ option.label }</option>;
						} ) }
					</FormSelect>
				</div>
				{ this.props.errorMessage && <FormInputValidation text={ this.props.errorMessage } isError /> }
			</div>
		);
	}
} );
