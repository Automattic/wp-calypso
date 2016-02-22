/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';

const PostExcerpt = React.createClass( {

	propTypes: {
		content: React.PropTypes.string.isRequired
	},

	render() {
		if ( ! this.props.content ) {
			return null;
		}

		const classes = classnames( {
			'post-excerpt': true,
			'is-long': ( this.props.content.length > 80 )
		} );

		return (
			<div className={ classes } dangerouslySetInnerHTML={{ __html: this.props.content }}></div> //eslint-disable-line react/no-danger
		);
	}
} );

export default PostExcerpt;
