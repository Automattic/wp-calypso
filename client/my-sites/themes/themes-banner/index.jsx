/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cssSafeUrl from 'lib/css-safe-url';
import { merge } from 'lodash';

export class ThemesBanner extends Component {
	static propTypes = {
		items: PropTypes.array.isRequired,
	};

	renderBannerItem = ( item, i ) => {
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
		} = item;

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

		const key = 'themes-banner__item-' + i;

		return (
			<div className="themes-banner__item" style={ backgroundStyle } key={ key }>
				<h1 style={ textStyle }>{ title }</h1>
				<p style={ textStyle }>{ description }</p>
				{ button }
			</div>
		);
	};

	render() {
		const { items } = this.props;
		const children = items.map( ( item, i ) => this.renderBannerItem( item, i ) );
		return <div className="themes-banner">{ children }</div>;
	}
}
