// External dependencies
var React = require( 'react' ),
	noop = require( 'lodash/noop' );

var FollowButton = React.createClass( {

	propTypes: {
		following: React.PropTypes.bool.isRequired,
		onFollowToggle: React.PropTypes.func
	},

	getDefaultProps: function() {
		return {
			following: false,
			onFollowToggle: noop,
			iconSize: 20,
			tagName: 'button'
		};
	},

	componentWillMount: function() {
		this.strings = {
			FOLLOW: this.translate( 'Follow' ),
			FOLLOWING: this.translate( 'Following' )
		};
	},

	toggleFollow: function( event ) {
		if ( event ) {
			event.preventDefault();
		}

		if ( this.props.onFollowToggle ) {
			this.props.onFollowToggle( ! this.props.following );
		}
	},

	render: function() {
		var menuClasses = [ 'button', 'follow-button', 'has-icon' ],
			label = this.strings.FOLLOW,
			iconSize = this.props.iconSize;

		if ( this.props.following ) {
			menuClasses.push( 'is-following' );
			label = this.strings.FOLLOWING;
		}

		menuClasses = menuClasses.join( ' ' );

		var followingIcon = ( <svg key="following" className="gridicon gridicon__following" height={ iconSize + "px" } width={ iconSize + "px" } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M23,13.482L15.508,21L12,17.4l1.412-1.388l2.106,2.188l6.094-6.094L23,13.482z M15.545,15.344L20,10.889V2H2v14
		c0,1.1,0.9,2,2,2h4.538l4.913-4.832L15.545,15.344z M8,13H4v-1h4V13z M11,11H4v-1h7V11z M11,9H4V8h7V9z M18,6H4V4h14V6z"/></g></svg> ),
			followIcon = ( <svg key="follow" className="gridicon gridicon__follow" height={ iconSize + "px" } width={ iconSize + "px" } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M23,16v2h-3v3h-2v-3h-3v-2h3v-3h2v3H23z M20,2v9h-4v3h-3v4H4c-1.1,0-2-0.9-2-2V2H20z M8,13v-1H4v1H8z M11,10H4v1h7V10z
		 M11,8H4v1h7V8z M18,4H4v2h14V4z"/></g></svg> ),
			followLabel = ( <span key="label" className="follow-button__label">{ label }</span> );

		return React.createElement( this.props.tagName, {
			onClick: this.toggleFollow,
			className: menuClasses,
			title: label
		}, [ followingIcon, followIcon, followLabel ] );
	}

} );

module.exports = FollowButton;
