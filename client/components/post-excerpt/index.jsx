/** @format */
/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';

import AutoDirection from 'components/auto-direction';
import Emojify from 'components/emojify';

const PostExcerpt = React.createClass( {
	propTypes: {
		content: React.PropTypes.string.isRequired,
		maxLength: React.PropTypes.number,
	},

	defaultProps: {
		maxLength: 80,
	},

	render() {
		if ( ! this.props.content ) {
			return null;
		}

		const classes = classnames( {
			'post-excerpt': true,
			'is-long': this.props.content.length > this.props.maxLength,
		} );

		return (
			<AutoDirection>
				<Emojify>
					<div
						className={ classes }
						dangerouslySetInnerHTML={ { __html: this.props.content } } // eslint-disable-line react/no-danger
					/>
				</Emojify>
			</AutoDirection>
		);
	},
} );

export default PostExcerpt;
