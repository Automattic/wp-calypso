/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { noop, intersection } from 'lodash';
import classNames from 'classnames';
import Gridicon from 'components/gridicon';

/**
 * Internal dependencies
 */
import i18n from 'i18n-calypso';
import { taxonomiesWelcomeWhitelist, taxonomyToGridicon } from './taxonomies-config.js';

class MagicSearchWelcome extends React.Component {
	constructor( props ) {
		super( props );
		this.visibleTaxonomies = [];
	}

	state = { suggestionPosition: -1 };

	onMouseDown = ( event ) => {
		this.props.suggestionsCallback( event.target.getAttribute( 'data-key' ) + ':' );
		event.stopPropagation();
		event.preventDefault();
	};

	movePositionBy = ( moveDirection ) => {
		let newPosition = this.state.suggestionPosition + moveDirection;

		// Loop around
		if ( newPosition < 0 ) {
			newPosition = this.visibleTaxonomies.length - 1;
		} else if ( newPosition > this.visibleTaxonomies.length - 1 ) {
			newPosition = 0;
		}

		this.setState( {
			suggestionPosition: newPosition,
		} );
	};

	/**
	 * Provides keybord support for component by managing items highlith position
	 * and calling suggestion callback when user hits Enter
	 *
	 * @param  {object} event  Keybord event
	 * @returns {boolean}      true indicates suggestion was chosen and send to parent using suggestionsCallback prop callback
	 */
	handleKeyEvent = ( event ) => {
		const position = this.state.suggestionPosition;
		switch ( event.key ) {
			case 'ArrowDown':
				this.movePositionBy( +1 );
				event.preventDefault();
				break;
			case 'ArrowUp':
				this.movePositionBy( -1 );
				event.preventDefault();
				break;
			case 'Enter':
				if ( position !== -1 ) {
					this.props.suggestionsCallback( this.visibleTaxonomies[ position ] + ':' );
					event.stopPropagation();
					event.preventDefault();
					return true;
				}
				break;
		}
		return false;
	};

	renderToken = ( taxonomy ) => {
		const themesTokenTypeClass = classNames(
			'themes-magic-search-card__welcome-taxonomy',
			'themes-magic-search-card__welcome-taxonomy-type-' + taxonomy,
			{
				'themes-magic-search-card__welcome-taxonomy-highlight':
					this.visibleTaxonomies[ this.state.suggestionPosition ] === taxonomy,
			}
		);

		const taxonomyTranslations = {
			feature: i18n.translate( 'Feature', {
				context: 'Theme Showcase filter name',
			} ),
			layout: i18n.translate( 'Layout', {
				context: 'Theme Showcase filter name',
			} ),
			column: i18n.translate( 'Columns', {
				context: 'Theme Showcase filter name',
			} ),
			subject: i18n.translate( 'Subject', {
				context: 'Theme Showcase filter name',
			} ),
			style: i18n.translate( 'Style', {
				context: 'Theme Showcase filter name',
			} ),
		};

		return (
			<div
				className={ themesTokenTypeClass }
				onMouseDownCapture={ this.onMouseDown }
				key={ taxonomy }
				data-key={ taxonomy }
			>
				<Gridicon
					icon={ taxonomyToGridicon( taxonomy ) }
					className="themes-magic-search-card__welcome-taxonomy-icon"
					size={ 18 }
				/>
				{ taxonomyTranslations[ taxonomy ] ||
					i18n.translate( 'Unknown', {
						context: 'Theme Showcase filter name',
					} ) }
			</div>
		);
	};

	renderTaxonomies = () => {
		const { taxonomies } = this.props;
		this.visibleTaxonomies = intersection( taxonomies, taxonomiesWelcomeWhitelist );
		return this.visibleTaxonomies.map( ( taxonomy ) => this.renderToken( taxonomy ) );
	};

	render() {
		return (
			<div className="themes-magic-search-card__welcome">
				<div className="themes-magic-search-card__welcome-header">
					{ i18n.translate( 'Search by' ) }
				</div>
				<div className="themes-magic-search-card__welcome-taxonomies">
					{ this.renderTaxonomies() }
				</div>
			</div>
		);
	}
}

MagicSearchWelcome.propTypes = {
	taxonomies: PropTypes.array,
	topSearches: PropTypes.array,
	suggestionsCallback: PropTypes.func,
};

MagicSearchWelcome.defaultProps = {
	taxonomies: [],
	topSearches: [],
	suggestionsCallback: noop,
};

export default MagicSearchWelcome;
