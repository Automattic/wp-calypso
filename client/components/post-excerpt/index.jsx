/** @format */
/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import AutoDirection from 'components/auto-direction';
import Emojify from 'components/emojify';

const PostExcerpt = React.createClass( {
	propTypes: {
		content: PropTypes.string.isRequired,
		maxLength: PropTypes.number,
	},

	getDefaultProps() {
		return { maxLength: 80 };
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
