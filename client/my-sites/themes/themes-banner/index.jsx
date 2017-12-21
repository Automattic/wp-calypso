/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cssSafeUrl from 'lib/css-safe-url';

export class ThemesBanner extends Component {
	static propTypes = {
		title: PropTypes.string.isRequired,
		description: PropTypes.string.isRequired,
		ctaLabel: PropTypes.string.isRequired,
		ctaAction: PropTypes.func,
		backgroundImage: PropTypes.string,
	};

	renderButton = ( label, action, primary ) => {
		return (
			<button
				type="button"
				className={ primary ? 'button is-primary is-compact' : 'button is-compact' }
				onClick={ action }
			>
				{ label }
			</button>
		);
	};

	getBackgroundStyle = img => {
		if ( img ) {
			const imgUrl = cssSafeUrl( img );
			return {
				backgroundImage: 'url(' + imgUrl + ')',
			};
		}
		return null;
	};

	render() {
		const { title, description, ctaLabel, ctaAction, backgroundImage } = this.props;
		const button = this.renderButton( ctaLabel, ctaAction, !! backgroundImage );
		const backgroundStyle = this.getBackgroundStyle( backgroundImage );
		return (
			<div className="themes-banner" style={ backgroundStyle }>
				<h1>{ title }</h1>
				<p>{ description }</p>
				{ button }
			</div>
		);
	}
}
