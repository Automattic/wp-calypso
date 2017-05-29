/**
 * External dependencies
 */
import React, { PureComponent, PropTypes } from 'react';
import twemoji from 'twemoji';
import config from 'config';

export default class Emojify extends PureComponent {
	static propTypes = {
		children: PropTypes.oneOfType( [
			PropTypes.array.isRequired,
			PropTypes.object.isRequired,
			PropTypes.string.isRequired,
		] ),
		className: PropTypes.string
	}

	static defaultProps = {
		className: 'emojify__emoji'
	}

	componentDidMount() {
		this.parseEmoji();
	}

	componentDidUpdate() {
		this.parseEmoji();
	}

	parseEmoji = () => {
		const { className } = this.props;

		twemoji.parse( this.refs.emojified, {
			base: config( 'twemoji_cdn_url' ),
			size: '72x72',
			className: className
		} );
	}

	render() {
		if ( 'string' === typeof this.props.children ) {
			return (
				<span ref="emojified">{ this.props.children }</span>
			);
		}

		return (
			<div ref="emojified">{ this.props.children }</div>
		);
	}
}
