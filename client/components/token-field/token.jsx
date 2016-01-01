/**
 * External dependencies
 */
var React = require( 'react' ),
	PureRenderMixin = require( 'react-pure-render/mixin' ),
	noop = require( 'lodash/utility/noop' );

var Token = React.createClass( {
	propTypes: {
		value: React.PropTypes.string.isRequired,
		displayTransform: React.PropTypes.func.isRequired,
		onClickRemove: React.PropTypes.func
	},

	getDefaultProps: function() {
		return {
			onClickRemove: noop
		};
	},

	mixins: [ PureRenderMixin ],

	render: function() {
		return (
			<span className="token-field__token" tabIndex="-1">
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
