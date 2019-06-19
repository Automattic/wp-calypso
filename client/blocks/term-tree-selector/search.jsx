/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import Gridicon from 'gridicons';

/**
 * Style dependencies
 */
import './search.scss';

function TermTreeSelectorSearch( { searchTerm, onSearch } ) {
	const translate = useTranslate();

	return (
		<div className="term-tree-selector__search">
			<Gridicon icon="search" size={ 18 } />
			<input
				type="search"
				placeholder={ translate( 'Search…', { textOnly: true } ) }
				value={ searchTerm }
				onChange={ onSearch }
			/>
		</div>
	);
}

TermTreeSelectorSearch.propTypes = {
	searchTerm: PropTypes.string,
	onSearch: PropTypes.func.isRequired,
};

export default TermTreeSelectorSearch;
