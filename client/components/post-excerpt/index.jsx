import clsx from 'clsx';
import PropTypes from 'prop-types';
import { Component } from 'react';
import AutoDirection from 'calypso/components/auto-direction';

import './style.scss';

class PostExcerpt extends Component {
	static propTypes = {
		content: PropTypes.string.isRequired,
		maxLength: PropTypes.number,
	};

	static defaultProps = { maxLength: 80 };

	render() {
		if ( ! this.props.content ) {
			return null;
		}

		const classes = clsx( {
			'post-excerpt': true,
			'is-long': this.props.content.length > this.props.maxLength,
		} );

		return (
			<AutoDirection>
				<div
					className={ classes }
					dangerouslySetInnerHTML={ { __html: this.props.content } } // eslint-disable-line react/no-danger
				/>
			</AutoDirection>
		);
	}
}

export default PostExcerpt;
