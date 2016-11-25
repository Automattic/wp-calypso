/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { get, isUndefined } from 'lodash';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import { getSelectedSiteId, getSelectedSite } from 'state/ui/selectors';
import { getPostTypeTaxonomy } from 'state/post-types/taxonomies/selectors';
import { countFoundTermsForQuery } from 'state/terms/selectors';

import CompactCard from 'components/card/compact';
import QueryTerms from 'components/data/query-terms';
import Gridicon from 'components/gridicon';

const TaxonomyCard = ( { count, labels, site, taxonomy } ) => {
	const settingsLink = site ? `/settings/taxonomies/${ taxonomy }/${ site.slug }` : null;
	const isLoading = ! labels.name || isUndefined( count );
	const classes = classNames( 'taxonomies__card-title', {
		'is-loading': isLoading
	} );

	return (
		<CompactCard href={ settingsLink }>
			{ site && <QueryTerms siteId={ site.ID } taxonomy={ taxonomy }	query={ {} } /> }
			<h2 className={ classes }>{ labels.name }</h2>
			{ ! isLoading &&
				<div className="taxonomies__card-content">
					<Gridicon icon="tag" size={ 18 } /> { count } { labels.name }
				</div>
			}
		</CompactCard>
	);
};

export default connect(
	( state, { taxonomy, postType } ) => {
		const siteId = getSelectedSiteId( state );
		const site = getSelectedSite( state );
		const labels = get( getPostTypeTaxonomy( state, siteId, postType, taxonomy ), 'labels', {} );
		const count = countFoundTermsForQuery( state, siteId, taxonomy, {} );
		return {
			count,
			labels,
			site
		};
	}
)( TaxonomyCard );
