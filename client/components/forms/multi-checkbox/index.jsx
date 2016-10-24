/**
 * External dependencies
 */
var React = require( 'react' ),
	omit = require( 'lodash/omit' ),
	debug = require( 'debug' )( 'calypso:forms:multi-checkbox' );

var MultiCheckbox = module.exports = React.createClass({
	displayName: 'MultiCheckbox',

	propTypes: {
		defaultChecked: React.PropTypes.array,
		onChange: React.PropTypes.func,
		disabled: React.PropTypes.bool
	},

	getInitialState: function() {
		return { initialChecked: this.props.defaultChecked };
	},

	getDefaultProps: function() {
		return {
			defaultChecked: Object.freeze( [] ),
			onChange: function() {},
			disabled: false
		};
	},

	componentWillMount: function() {
		debug( 'Mounting ' + this.constructor.displayName + ' React component.' );
	},

	handleChange: function( event ) {
		var target = event.target,
			checked = this.props.checked || this.state.initialChecked;

		checked = checked.concat( [ target.value ] ).filter( function( currentValue ) {
			return currentValue !== target.value || target.checked;
		} );

		this.props.onChange( {
			value: checked
		} );

		event.stopPropagation();
	},

	getCheckboxElements: function() {
		var checked = this.props.checked || this.state.initialChecked;

		return this.props.options.map( function( option ) {
			var isChecked = checked.indexOf( option.value ) !== -1;

			return (
				<label key={ option.value }>
					<input name={ this.props.name + '[]' } type="checkbox" value={ option.value } checked={ isChecked } onChange={ this.handleChange } disabled={ this.props.disabled } />
					<span>{ option.label }</span>
				</label>
			);
		}, this );
	},

	render: function() {
		return <div className="form-checkbox-group" { ...omit( this.props, Object.keys( MultiCheckbox.propTypes ) ) }>{ this.getCheckboxElements() }</div>;
	}
} );
