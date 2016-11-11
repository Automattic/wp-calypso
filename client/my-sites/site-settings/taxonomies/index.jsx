/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';
import page from 'page';

/**
 * Internal dependencies
 */
import HeaderCake from 'components/header-cake';
import TaxonomyManager from 'blocks/taxonomy-manager';
import { getSelectedSite, getSelectedSiteId } from 'state/ui/selectors';
import { getPostTypeTaxonomy } from 'state/post-types/taxonomies/selectors';

const Taxonomies = ( { labels, postType, site, taxonomy } ) => {
	const goBack = () => {
		page( '/settings/writing/' + site.slug );
	};

	return (
		<div className="main main-column" role="main">
			<HeaderCake onClick={ goBack }>
				<h1>{ labels.name }</h1>
			</HeaderCake>
			<TaxonomyManager taxonomy={ taxonomy } postType={ postType } />
		</div>
	);
};

export default connect(
	( state, { taxonomy, postType } ) => {
		const siteId = getSelectedSiteId( state );
		const site = getSelectedSite( state );
		const labels = get( getPostTypeTaxonomy( state, siteId, postType, taxonomy ), 'labels', {} );
		return {
			site,
			labels
		};
	}
)( Taxonomies );
