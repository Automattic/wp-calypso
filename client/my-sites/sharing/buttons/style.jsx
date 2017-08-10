/** @format */
/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var analytics = require( 'lib/analytics' );

module.exports = React.createClass( {
	displayName: 'SharingButtonsStyle',

	propTypes: {
		onChange: React.PropTypes.func,
		value: React.PropTypes.string,
		disabled: React.PropTypes.bool,
	},

	getDefaultProps: function() {
		return {
			onChange: function() {},
			disabled: false,
		};
	},

	onChange: function( value ) {
		this.props.onChange( value );
		analytics.ga.recordEvent( 'Sharing', 'Clicked Button Style Radio Button', value );
	},

	getOptions: function() {
		return [
			{
				value: 'icon-text',
				label: this.translate( 'Icon & Text', { context: 'Sharing: Sharing button option label' } ),
			},
			{
				value: 'icon',
				label: this.translate( 'Icon Only', { context: 'Sharing: Sharing button option label' } ),
			},
			{
				value: 'text',
				label: this.translate( 'Text Only', { context: 'Sharing: Sharing button option label' } ),
			},
			{
				value: 'official',
				label: this.translate( 'Official Buttons', {
					context: 'Sharing: Sharing button option label',
				} ),
			},
		].map( function( option ) {
			return (
				<label key={ option.value }>
					<input
						name="sharing_button_style"
						type="radio"
						checked={ option.value === this.props.value }
						onChange={ this.onChange.bind( null, option.value ) }
						disabled={ this.props.disabled }
					/>
					{ option.label }
				</label>
			);
		}, this );
	},

	render: function() {
		return (
			<fieldset className="sharing-buttons__fieldset">
				<legend className="sharing-buttons__fieldset-heading">
					{ this.translate( 'Button style', {
						context: 'Sharing: Sharing button option heading',
					} ) }
				</legend>
				{ this.getOptions() }
			</fieldset>
		);
	},
} );
