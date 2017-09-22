/**
 * External dependencies
 */
import classnames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import AutoDirection from 'components/auto-direction';
import Emojify from 'components/emojify';

const PostExcerpt = React.createClass( {

	propTypes: {
		content: PropTypes.string.isRequired,
		maxLength: PropTypes.number
	},

	defaultProps: {
		maxLength: 80
	},

	render() {
		if ( ! this.props.content ) {
			return null;
		}

		const classes = classnames( {
			'post-excerpt': true,
			'is-long': ( this.props.content.length > this.props.maxLength )
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
	}
} );

export default PostExcerpt;
