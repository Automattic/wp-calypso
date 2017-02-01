/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { noop } from 'lodash';
import classNames from 'classnames';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import { localize } from 'i18n-calypso';
import { taxonomyToGridicon } from './taxonomy-styling.js';

class MagicSearchWelcome extends React.Component {

	constructor( props ) {
		super( props );
	}

	onMouseDown = ( event ) => {
		this.props.suggestionsCallback( event.target.textContent + ':' );
	}

	renderToken = ( taxonomy ) => {
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
	}

	render() {
		return (
			<div className="themes-magic-search-card__welcome" >
				<span className="themes-magic-search-card__welcome-header">{ this.props.translate( 'Search by' ) }</span>
				<div className="themes-magic-search-card__welcome-taxonomies">
					{ this.props.taxonomies.map( taxonomy => this.renderToken( taxonomy ) ) }
				</div>
			</div>
		);
	}
}

MagicSearchWelcome.propTypes = {
	taxonomies: PropTypes.array,
	topSearches: PropTypes.array,
	suggestionsCallback: PropTypes.func,
	translate: React.PropTypes.func.isRequired,
};

MagicSearchWelcome.defaultProps = {
	taxonomies: [],
	topSearches: [],
	suggestionsCallback: noop
};

export default localize( MagicSearchWelcome );
