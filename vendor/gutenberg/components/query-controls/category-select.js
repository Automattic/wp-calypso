/**
 * WordPress dependencies
 */
import { buildTermsTree } from '@wordpress/utils';

/**
 * Internal dependencies
 */
import TreeSelect from '../tree-select';

export default function CategorySelect( { label, noOptionLabel, categoriesList, selectedCategoryId, onChange } ) {
	const termsTree = buildTermsTree( categoriesList );
	return (
		<TreeSelect
			{ ...{ label, noOptionLabel, onChange } }
			tree={ termsTree }
			selectedId={ selectedCategoryId }
		/>
	);
}
