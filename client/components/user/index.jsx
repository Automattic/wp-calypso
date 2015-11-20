/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var Gravatar = require( 'components/gravatar' );

module.exports = React.createClass( {
	displayName: 'UserItem',
	propTypes: {
		user: React.PropTypes.object
	},

	render: function() {
		var user = this.props.user || null,
		name = user ? user.name : '';
		return (
			<div className="user" title={ name }>
				<Gravatar size={ 26 } user={ user } />
				<span className="user__name">
					{ name }
				</span>
			</div>
		);
	}
} );
