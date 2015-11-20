// External dependencies
var React = require( 'react' ),
	noop = require( 'lodash/utility/noop' );

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
		var menuClasses = [ 'follow-button', 'has-icon' ],
			label = this.strings.FOLLOW,
			iconSize = this.props.iconSize;

		if ( this.props.following ) {
			menuClasses.push( 'is-following' );
			label = this.strings.FOLLOWING;
		}

		menuClasses = menuClasses.join( ' ' );

		var followingIcon = ( <svg key="following" className="gridicon gridicon__following" height={ iconSize + "px" } width={ iconSize + "px" } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M11.944 17.083L7 12.056l1.648-1.676 3.296 3.352 8.3-7.385C18.445 3.722 15.425 2 12 2 6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10c0-1.212-.227-2.37-.622-3.444l-9.434 8.527z"/></g></svg> ),
			followIcon = ( <svg key="follow" className="gridicon gridicon__follow" height={ iconSize + "px" } width={ iconSize + "px" } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M12 4c4.41 0 8 3.59 8 8s-3.59 8-8 8-8-3.59-8-8 3.59-8 8-8m0-2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z"/><path d="M11 6h2v12.1h-2z"/><path d="M6 11h11.83v2H6z"/></g></svg> ),
			followLabel = ( <span key="label" className="follow-button__label">{ label }</span> );

		return React.createElement( this.props.tagName, {
			onClick: this.toggleFollow,
			className: menuClasses,
			title: label
		}, [ followingIcon, followIcon, followLabel ] );
	}

} );

module.exports = FollowButton;
