/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import classNames from 'classnames';
import twemoji from 'twemoji';

export default class Emojify extends PureComponent {
	static propTypes = {
		imgClassName: PropTypes.string,
		twemojiUrl: PropTypes.string,
	};

	static defaultProps = {
		imgClassName: 'emojify__emoji',
	};

	constructor( props ) {
		super( props );
		this.setRef = this.setRef.bind( this );
	}

	componentDidMount() {
		this.parseEmoji();
	}

	componentDidUpdate() {
		this.parseEmoji();
	}

	setRef( component ) {
		this.emojified = component;
	}

	parseEmoji = () => {
		const { imgClassName, twemojiUrl } = this.props;

		twemoji.parse( this.emojified, {
			base: twemojiUrl,
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
		// We want other props to content everything but children, className, imgClassName, and twemojiUrl.
		// We can't delete imgClassName and twemojiUrl despite they not being used here.
		const { children, className, imgClassName, twemojiUrl, ...other } = this.props; // eslint-disable-line no-unused-vars

		const classes = classNames( className, 'emojify' );

		return (
			<div className={ classes } ref={ this.setRef } { ...other }>
				{ children }
			</div>
		);
	}
}
