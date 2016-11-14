/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import { getSelectedSiteId, getSelectedSite } from 'state/ui/selectors';
import { getPostTypeTaxonomy } from 'state/post-types/taxonomies/selectors';

import CompactCard from 'components/card/compact';

const TaxonomyCard = ( { labels, site, taxonomy } ) => {
	const settingsLink = site ? `/settings/taxonomies/${ site.slug }/${ taxonomy }` : null;
	const classes = classNames( 'taxonomies__card-title', {
		'is-loading': ! labels.name
	} );

	return (
		<CompactCard href={ settingsLink }>
				<h2 className={ classes }>{ labels.name }</h2>
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
