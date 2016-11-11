/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { getSelectedSiteId, getSelectedSite } from 'state/ui/selectors';
import { getPostTypeTaxonomy } from 'state/post-types/taxonomies/selectors';

import CompactCard from 'components/card/compact';

const TaxonomyCard = ( { labels, site, taxonomy } ) => {
	const settingsLink = `/settings/taxonomies/${ site.slug }/${ taxonomy }`;
	return (
		<CompactCard href={ settingsLink }>
				<h2 className="taxonomies__card-title">{ labels.name }</h2>
		</CompactCard>
	);
};

export default connect(
	( state, { taxonomy, postType } ) => {
		const siteId = getSelectedSiteId( state );
		const site = getSelectedSite( state );
		const labels = get( getPostTypeTaxonomy( state, siteId, postType, taxonomy ), 'labels', {} );
		return {
			labels,
			site
		};
	}
)( TaxonomyCard );
