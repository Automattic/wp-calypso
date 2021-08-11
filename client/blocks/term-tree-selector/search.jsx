import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React from 'react';
import FormTextInput from 'calypso/components/forms/form-text-input';
import Gridicon from 'calypso/components/gridicon';

import './search.scss';

function TermTreeSelectorSearch( { searchTerm, onSearch } ) {
	const translate = useTranslate();

	return (
		<div className="term-tree-selector__search">
			<Gridicon icon="search" size={ 18 } />
			<FormTextInput
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
