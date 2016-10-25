/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { noop } from 'lodash';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';
import { taxonomyToGridicon } from './taxonomy-styling.js';

const MagicSearchWelcome = React.createClass( {

	propTypes: {
		taxonomies: PropTypes.array,
		topSearches: PropTypes.array,
		suggestionsCallback: PropTypes.func,
	},

	defaultProps: {
		taxonomies: [],
		topSearches: [],
		suggestionsCallback: noop,
	},

	onMouseDown( event ) {
		this.props.suggestionsCallback( event.target.textContent + ':' );
	},

	renderToken( taxonomy ) {
		const themesTokenTypeClass = classNames(
			'themes-magic-search-card__welcome-taxonomy',
			'themes-magic-search-card__welcome-taxonomy-type-' + taxonomy
		);

		return (
			<div
				className={ themesTokenTypeClass }
				onMouseDown={ this.onMouseDown }
				key={ taxonomy }
			>
				<Gridicon icon={ taxonomyToGridicon( taxonomy ) } className="themes-magic-search-card__welcome-taxonomy-icon" size={ 18 } />
				{ taxonomy }
			</div>
		);
	},

	render() {
		return (
			<div className="themes-magic-search-card__welcome" >
				<span className="themes-magic-search-card__welcome-header">{ this.translate('Search by') }</span>
				<div className="themes-magic-search-card__welcome-taxonomies">
					{ this.props.taxonomies.map( taxonomy => this.renderToken( taxonomy ) ) }
				</div>
			</div>
		);
	}
} );

export default MagicSearchWelcome;
