/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import page from 'page';

export default class CommentLink extends PureComponent {
	static propTypes = {
		commentId: PropTypes.number,
		href: PropTypes.string,
	};

	handleClick = ( event ) => {
		event.preventDefault();
		window.scrollTo( 0, 0 );

		const { commentId, href } = this.props;
		const { path } = window.history.state;

		const newPath = path.includes( '#' )
			? path.replace( /[#].*/, `#comment-${ commentId }` )
			: `${ path }#comment-${ commentId }`;

		window.history.replaceState( { ...window.history.state, path: newPath }, null );

		page( href );
	};

	render() {
		const { href, commentId, ...props } = this.props;
		return <a href={ href } { ...props } onClick={ this.handleClick } />;
	}
}
