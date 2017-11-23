/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cssSafeUrl from 'lib/css-safe-url';
import { merge } from 'lodash';

export class ThemesBannerItem extends Component {
	static propTypes = {
		title: PropTypes.string.isRequired,
		description: PropTypes.string.isRequired,
		buttonLabel: PropTypes.string,
		buttonAction: PropTypes.func,
		buttonType: PropTypes.oneOf( [ 'normal', 'primary' ] ),
		backgroundImage: PropTypes.string,
		backgroundColor: PropTypes.string,
		textColor: PropTypes.string,
		textShadowColor: PropTypes.string,
	};

	render() {
		const {
			title,
			description,
			buttonLabel,
			buttonType,
			buttonAction,
			backgroundImage,
			backgroundColor,
			textColor,
			textShadowColor,
		} = this.props;

		let backgroundStyle = {},
			textStyle = {};

		if ( backgroundImage ) {
			const safeCssUrl = cssSafeUrl( backgroundImage );
			backgroundStyle = merge( backgroundStyle, {
				backgroundImage: 'url(' + safeCssUrl + ')',
			} );
		}

		if ( backgroundColor ) {
			backgroundStyle = merge( backgroundStyle, { backgroundColor } );
		}

		if ( textColor ) {
			textStyle = merge( textStyle, {
				color: textColor,
			} );
		}

		if ( textShadowColor ) {
			textStyle = merge( textStyle, {
				textShadow: '0 1px 1px ' + textShadowColor,
			} );
		}

		const button = buttonLabel ? (
			<button
				type="button"
				className={ 'primary' === buttonType ? 'button is-primary' : 'button' }
				onClick={ buttonAction || null }
			>
				{ buttonLabel }
			</button>
		) : null;

		return (
			<div className="themes-banner__item" style={ backgroundStyle }>
				<h1 style={ textStyle }>{ title }</h1>
				<p style={ textStyle }>{ description }</p>
				{ button }
			</div>
		);
	}
}
