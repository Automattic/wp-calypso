/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import SearchCard from 'components/search-card';

function Typeahead( { value, onSearch, searching, children } ) {
	const classes = classnames( 'typeahead', {
		'has-results': React.Children.count( children ) > 0
	} );

	return (
		<div className={ classes }>
			<SearchCard
				initialValue={ value }
				onSearch={ onSearch }
				searching={ searching }
				delaySearch={ true }
				className="typeahead__search" />
			<ul className="typeahead__results">
				{ React.Children.map( children, ( child ) => {
					return (
						<li className="typeahead__result">
							{ child }
						</li>
					);
				} ) }
			</ul>
		</div>
	);
}

Typeahead.propTypes = {
	value: PropTypes.string,
	onSearch: PropTypes.func,
	searching: PropTypes.bool,
	children: PropTypes.node
};

Typeahead.defaultProps = {
	onSearch: () => {},
	searching: false
};

export default Typeahead;
