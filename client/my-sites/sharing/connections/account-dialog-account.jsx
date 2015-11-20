/**
 * External dependencies
 */
var React = require( 'react' ),
	classNames = require( 'classnames' );

module.exports = React.createClass( {
	displayName: 'AccountDialogAccount',

	propTypes: {
		account: React.PropTypes.shape( {
			ID: React.PropTypes.oneOfType( [ React.PropTypes.number, React.PropTypes.string ] ),
			name: React.PropTypes.string,
			picture: React.PropTypes.string,
			keyringConnectionId: React.PropTypes.number,
			isConnected: React.PropTypes.bool,
			isExternal: React.PropTypes.bool
		} ).isRequired,
		selected: React.PropTypes.bool,
		conflicting: React.PropTypes.bool,
		onChange: React.PropTypes.func
	},

	getDefaultProps: function() {
		return {
			connected: false,
			selected: false,
			conflicting: false,
			onChange: function() {}
		};
	},

	getPictureElement: function() {
		if ( this.props.account.picture ) {
			return <img src={ this.props.account.picture } alt={ this.props.account.name } className="account-dialog-account__picture" />;
		}
	},

	getRadioElement: function() {
		if ( ! this.props.account.isConnected ) {
			return <input type="radio" onChange={ this.props.onChange } checked={ this.props.selected } className="account-dialog-account__input" />;
		}
	},

	render: function() {
		var classes = classNames( 'account-dialog-account', {
			'is-connected': this.props.account.isConnected,
			'is-conflict': this.props.conflicting
		} );

		return (
			<li className={ classes }>
				<label className="account-dialog-account__label">
					{ this.getRadioElement() }
					{ this.getPictureElement() }
					<span className="account-dialog-account__name">{ this.props.account.name }</span>
				</label>
			</li>
		);
	}
} );
