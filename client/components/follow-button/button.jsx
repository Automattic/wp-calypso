/**
* External dependencies
*/
import React from 'react';
import { noop } from 'lodash';

const FollowButton = React.createClass( {

	propTypes: {
		following: React.PropTypes.bool.isRequired,
		onFollowToggle: React.PropTypes.func,
		iconSize: React.PropTypes.number,
		tagName: React.PropTypes.string,
		disabled: React.PropTypes.bool
	},

	getDefaultProps() {
		return {
			following: false,
			onFollowToggle: noop,
			iconSize: 20,
			tagName: 'button',
			disabled: false
		};
	},

	componentWillMount() {
		this.strings = {
			FOLLOW: this.translate( 'Follow' ),
			FOLLOWING: this.translate( 'Following' )
		};
	},

	toggleFollow( event ) {
		if ( event ) {
			event.preventDefault();
		}

		if ( this.props.disabled ) {
			return;
		}

		if ( this.props.onFollowToggle ) {
			this.props.onFollowToggle( ! this.props.following );
		}
	},

	render() {
		let label = this.strings.FOLLOW;
		const menuClasses = [ 'button', 'follow-button', 'has-icon' ];
		const iconSize = this.props.iconSize;

		if ( this.props.following ) {
			menuClasses.push( 'is-following' );
			label = this.strings.FOLLOWING;
		}

		if ( this.props.disabled ) {
			menuClasses.push( 'is-disabled' );
		}

		const followingIcon = ( <svg key="following" className="gridicon gridicon__following" height={ iconSize + 'px' } width={ iconSize + 'px' } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M23 13.482L15.508 21 12 17.4l1.412-1.388 2.106 2.188 6.094-6.094L23 13.482zm-7.455 1.862L20 10.89V2H2v14c0 1.1.9 2 2 2h4.538l4.913-4.832 2.095 2.176zM8 13H4v-1h4v1zm3-2H4v-1h7v1zm0-2H4V8h7v1zm7-3H4V4h14v2z"/></g></svg> ),
			followIcon = ( <svg key="follow" className="gridicon gridicon__follow" height={ iconSize + 'px' } width={ iconSize + 'px' } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M23 16v2h-3v3h-2v-3h-3v-2h3v-3h2v3h3zM20 2v9h-4v3h-3v4H4c-1.1 0-2-.9-2-2V2h18zM8 13v-1H4v1h4zm3-3H4v1h7v-1zm0-2H4v1h7V8zm7-4H4v2h14V4z"/></g></svg> ),
			followLabel = ( <span key="label" className="follow-button__label">{ label }</span> );

		return React.createElement( this.props.tagName, {
			onClick: this.toggleFollow,
			className: menuClasses.join( ' ' ),
			title: label
		}, [ followingIcon, followIcon, followLabel ] );
	}

} );

export default FollowButton;
