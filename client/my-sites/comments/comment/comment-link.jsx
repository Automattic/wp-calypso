/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { get, includes, omit } from 'lodash';

/**
 * Internal dependencies
 */
import { navigate } from 'state/ui/actions';

export class CommentLink extends PureComponent {
	static propTypes = {
		children: PropTypes.any,
		commentId: PropTypes.number,
		href: PropTypes.string,
		navigate: PropTypes.func,
	};

	handleClick = ( event ) => {
		if ( ! window ) {
			return;
		}
		event.preventDefault();
		window.scrollTo( 0, 0 );

		const { commentId, href } = this.props;
		const path = get( window, 'history.state.path' );

		const newPath = includes( path, '#' )
			? path.replace( /[#].*/, `#comment-${ commentId }` )
			: `${ path }#comment-${ commentId }`;

		window.history.replaceState( { ...window.history.state, path: newPath }, null );

		this.props.navigate( href );
	};

	render() {
		const { children, href } = this.props;
		return (
			<a
				href={ href }
				onClick={ this.handleClick }
				{ ...omit( this.props, [ 'children', 'commentId', 'href', 'navigate' ] ) }
			>
				{ children }
			</a>
		);
	}
}

const mapDispatchToProps = { navigate };

export default connect( null, mapDispatchToProps )( CommentLink );
