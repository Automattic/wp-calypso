import React, { PropTypes } from 'react';

import MysteryMan from './mystery-man';

export const Avatar = React.createClass( {
	getInitialState: () => ( {
		hasLoaded: false
	} ),

	componentWillMount() {
		const { src } = this.props;

		this.fetchAvatar( src, null );
	},

	componentWillReceiveProps( { src } ) {
		this.fetchAvatar( src, this.props.src );
	},

	componentWillUnmount() {
		this.avatar.removeEventListener( 'load', this.replaceMysteryMan );
	},

	fetchAvatar( src, prevSrc ) {
		if ( src === prevSrc ) {
			return;
		}

		const avatar = new Image();
		avatar.addEventListener( 'load', this.replaceMysteryMan );
		avatar.src = src;
		this.avatar = avatar;

		this.setState( {
			hasLoaded: !! avatar.complete
		} );
	},

	replaceMysteryMan() {
		this.setState( { hasLoaded: true } );
	},

	render() {
		const { hasLoaded } = this.state;
		const { src } = this.props;

		return hasLoaded
			? <img className="notifications__list-avatar" { ...{ src } } />
			: <div className="notifications__list-avatar"><MysteryMan /></div>;
	}
} );

Avatar.propTypes = {
	src: PropTypes.string
};

export default Avatar;
