/**
 * External dependencies
 */
var React = require( 'react' ),
	PureRenderMixin = require( 'react-pure-render/mixin' ),
	classNames = require( 'classnames' );

var Token = React.createClass( {
	propTypes: {
		value: React.PropTypes.string.isRequired,
		displayTransform: React.PropTypes.func.isRequired,
		onClickRemove: React.PropTypes.func,
		status: React.PropTypes.oneOf( [ 'error', 'success', 'validating' ] ),
		isBorderless: React.PropTypes.bool
	},

	getDefaultProps: function() {
		return {
			onClickRemove: function() {},
			isBorderless: false
		};
	},

	mixins: [ PureRenderMixin ],

	render: function() {
		const tokenClasses = classNames( 'token-field__token', {
			'is-error': 'error' === this.props.status,
			'is-success': 'success' === this.props.status,
			'is-validating': 'validating' === this.props.status,
			'is-borderless': this.props.isBorderless
		} );

		return (
			<span className={ tokenClasses } tabIndex="-1">
				<span className="token-field__token-text">
					{ this.props.displayTransform( this.props.value ) }
				</span>
				<span
					className="token-field__remove-token noticon noticon-close-alt"
					onClick={ this._onClickRemove } />
			</span>
		);
	},

	_onClickRemove: function() {
		this.props.onClickRemove( {
			value: this.props.value
		} );
	}
} );

module.exports = Token;
