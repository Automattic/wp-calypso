/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';
import striptags from 'striptags';

const PostExcerpt = React.createClass( {

	propTypes: {
		content: React.PropTypes.string.isRequired
	},

	render() {
		if ( ! this.props.content ) {
			return null;
		}

		// Strip all non-linebreak tags
		const preparedContent = striptags( this.props.content, [ 'p', 'br' ] );

		const classes = classnames( {
			'post-excerpt': true,
			'is-long': ( preparedContent.length > 80 )
		} );

		return (
			<div className={ classes } dangerouslySetInnerHTML={{ __html: preparedContent }}></div> //eslint-disable-line react/no-danger
		);
	}
} );

export default PostExcerpt;
