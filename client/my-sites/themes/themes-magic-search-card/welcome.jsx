/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';
import { taxonomyToGridicon, taxonomyToColor } from './taxonomy-styling.js';

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

	onMouseDown: function( event ) {
		this.props.suggestionsCallback( event.target.textContent + ':' );
	},

	render() {
		return (
			<div className="themes-magic-search-card__welcome" >
				<span className="themes-magic-search-card__welcome-header">SEARCH BY</span>
				<div className="themes-magic-search-card__welcome-taxonomies">
					{ this.props.taxonomies.map( taxonomy =>
						<div
							className="themes-magic-search-card__welcome-taxonomy"
							style={ taxonomyToColor( taxonomy ) }
							onMouseDown={ this.onMouseDown }
							key={ taxonomy }
						>
							<Gridicon icon={ taxonomyToGridicon( taxonomy ) } className="themes-magic-search-card__welcome-taxonomy-icon" />
							{taxonomy}
						</div> ) }
				</div>
			</div>
		);
	}
} );

export default MagicSearchWelcome;
