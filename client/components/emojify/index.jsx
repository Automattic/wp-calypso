/** @format */
/**
 * External dependencies
 */
import React, { PureComponent, PropTypes } from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import twemoji from 'twemoji';
import config from 'config';

export default class Emojify extends PureComponent {
	static propTypes = {
		children: PropTypes.oneOfType( [
			PropTypes.array.isRequired,
			PropTypes.object.isRequired,
			PropTypes.string.isRequired,
		] ),
		imgClassName: PropTypes.string,
	};

	static defaultProps = {
		imgClassName: 'emojify__emoji',
	};

	componentDidMount() {
		this.parseEmoji();
	}

	componentDidUpdate() {
		this.parseEmoji();
	}

	parseEmoji = () => {
		const { imgClassName } = this.props;

		twemoji.parse( this.refs.emojified, {
			base: config( 'twemoji_cdn_url' ),
			size: '72x72',
			className: imgClassName,
			callback: function( icon, options ) {
				const ignored = [ 'a9', 'ae', '2122', '2194', '2660', '2663', '2665', '2666' ];

				if ( -1 !== ignored.indexOf( icon ) ) {
					return false;
				}

				return ''.concat( options.base, options.size, '/', icon, options.ext );
			},
		} );
	};

	render() {
		const {
			children,
			className,
			imgClassName, // eslint-disable-line no-unused-vars
			...other
		} = this.props;

		const classes = classNames( className, 'emojify' );

		return (
			<div className={ classes } ref="emojified" { ...other }>
				{ children }
			</div>
		);
	}
}
