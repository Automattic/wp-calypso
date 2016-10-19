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

const MagicSearchWelcome = ( { taxonomies, topSearches, suggestionsCallback } ) => {

  const onMouseDown = event => suggestionsCallback( event.target.textContent );

  return (
    <div className="themes-magic-search-card__welcome" >
      <span className="themes-magic-search-card__welcome-header">SEARCH BY</span>
      <div className="themes-magic-search-card__welcome-taxonomies">
        { taxonomies.map( taxonomy =>
          <div
            className="themes-magic-search-card__welcome-taxonomy"
            style={ taxonomyToColor( taxonomy ) }
            onMouseDown={ onMouseDown }
          >
            <Gridicon icon={ taxonomyToGridicon( taxonomy ) } className="themes-magic-search-card__welcome-taxonomy-icon"/>
            {taxonomy}
          </div> ) }
      </div>
      { /*
        <hr/>
        <span className="themes-magic-search-card__welcome-header">TOP SEARCHES</span>
        <div className="themes-magic-search-card__welcome-top-searches">
        { topSearches.map( search =>  <div onMouseDown={ onMouseDown }>{search}</div> ) }
        </div>
      */}
    </div>
  );
};

MagicSearchWelcome.propTypes = {
  taxonomies: PropTypes.Array,
  topSearches: PropTypes.Array,
  suggestionsCallback: PropTypes.func,
};


MagicSearchWelcome.defaultProps = {
  taxonomies: [],
  topSearches: [],
  suggestionsCallback: noop,
};

export default MagicSearchWelcome;
