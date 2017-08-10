/** @format */
var PropTypes = require( 'prop-types' );
/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var analytics = require( 'lib/analytics' );

module.exports = localize(
	class extends React.Component {
		static displayName = 'SharingButtonsStyle';

		static propTypes = {
			onChange: PropTypes.func,
			value: PropTypes.string,
			disabled: PropTypes.bool,
		};

		static defaultProps = {
			onChange: function() {},
			disabled: false,
		};

		onChange = value => {
			this.props.onChange( value );
			analytics.ga.recordEvent( 'Sharing', 'Clicked Button Style Radio Button', value );
		};

		getOptions = () => {
			return [
				{
					value: 'icon-text',
					label: this.props.translate( 'Icon & Text', {
						context: 'Sharing: Sharing button option label',
					} ),
				},
				{
					value: 'icon',
					label: this.props.translate( 'Icon Only', {
						context: 'Sharing: Sharing button option label',
					} ),
				},
				{
					value: 'text',
					label: this.props.translate( 'Text Only', {
						context: 'Sharing: Sharing button option label',
					} ),
				},
				{
					value: 'official',
					label: this.props.translate( 'Official Buttons', {
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
		};

		render() {
			return (
				<fieldset className="sharing-buttons__fieldset">
					<legend className="sharing-buttons__fieldset-heading">
						{ this.props.translate( 'Button style', {
							context: 'Sharing: Sharing button option heading',
						} ) }
					</legend>
					{ this.getOptions() }
				</fieldset>
			);
		}
	}
);
