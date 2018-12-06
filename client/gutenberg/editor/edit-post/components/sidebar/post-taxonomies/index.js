/** @format */
/**
 * External dependencies
 */
import React from 'react';

/**
 * WordPress dependencies
 */
import { PostTaxonomies as PostTaxonomiesForm, PostTaxonomiesCheck } from '@wordpress/editor';

/**
 * Internal dependencies
 */
import TaxonomyPanel from './taxonomy-panel';

function PostTaxonomies() {
	return (
		<PostTaxonomiesCheck>
			<PostTaxonomiesForm
				taxonomyWrapper={ ( content, taxonomy ) => {
					return <TaxonomyPanel taxonomy={ taxonomy }>{ content }</TaxonomyPanel>;
				} }
			/>
		</PostTaxonomiesCheck>
	);
}

export default PostTaxonomies;
