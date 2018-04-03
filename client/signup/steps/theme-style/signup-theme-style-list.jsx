/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { find } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import themeStyles from 'lib/signup/theme-styles-data';
import Card from 'components/card';

class SignupThemeStyleList extends Component {
	static propTypes = {
		theme: PropTypes.string,
		handleScreenshotClick: PropTypes.func,
		translate: PropTypes.func,
	};

	static defaultProps = {
		theme: 'pub/radcliffe-2',
		handleScreenshotClick: () => {},
	};

	shouldComponentUpdate( nextProps ) {
		return nextProps.theme !== this.props.theme;
	}

	getThemeStyles() {
		return find( themeStyles, { themeSlug: this.props.theme } ) || null;
	}

	renderStyle = style => {
		return (
			<Card
				key={ style.slug }
				href={ `#${ style.slug }` }
				className="theme-style__item"
				onClick={ this.props.handleScreenshotClick }
			>
				<img className="theme-style__item-image" src={ style.image } alt={ style.name } />
				<div className="theme-style__item-copy">
					<span className="theme-style__item-cta button is-compact">{ style.name }</span>
					<p className="theme-style__item-description">{ style.description }</p>
				</div>
			</Card>
		);
	};

	render() {
		return (
			<div className="theme-style__list">
				{ this.getThemeStyles().styles.map( this.renderStyle ) }
			</div>
		);
	}
}

export default localize( SignupThemeStyleList );
