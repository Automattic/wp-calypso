/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import AutoDirection from 'calypso/components/auto-direction';
import Emojify from 'calypso/components/emojify';

/**
 * Style dependencies
 */
import './style.scss';

class PostExcerpt extends React.Component {
	static propTypes = {
		content: PropTypes.string.isRequired,
		maxLength: PropTypes.number,
	};

	static defaultProps = { maxLength: 80 };

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
	}
}

export default PostExcerpt;
