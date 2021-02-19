/**
 * External dependencies
 */

import React from 'react';
import { connect } from 'react-redux';
import { get, isUndefined } from 'lodash';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import Gridicon from 'calypso/components/gridicon';

/**
 * Internal dependencies
 */
import { getSelectedSiteId, getSelectedSite } from 'calypso/state/ui/selectors';
import { getPostTypeTaxonomy } from 'calypso/state/post-types/taxonomies/selectors';
import { countFoundTermsForQuery, getTerm } from 'calypso/state/terms/selectors';
import { getSiteSettings } from 'calypso/state/site-settings/selectors';
import { decodeEntities } from 'calypso/lib/formatting';
import { recordGoogleEvent, bumpStat } from 'calypso/state/analytics/actions';
import { CompactCard } from '@automattic/components';
import QueryTerms from 'calypso/components/data/query-terms';
import QuerySiteSettings from 'calypso/components/data/query-site-settings';

const TaxonomyCard = ( {
	count,
	defaultTerm,
	labels,
	site,
	taxonomy,
	translate,
	recordGoogleEvent: recordGAEvent,
	bumpStat: recordMCStat,
} ) => {
	const settingsLink = site ? `/settings/taxonomies/${ taxonomy }/${ site.slug }` : null;
	const isLoading = ! labels.name || isUndefined( count );
	const classes = classNames( 'taxonomies__card-title', {
		'is-loading': isLoading,
	} );

	const recordAnalytics = () => {
		recordGAEvent( 'Site Settings', `Clicked Writing Manage ${ taxonomy }` );
		recordMCStat( 'taxonomy_manager', `manage_${ taxonomy }` );
	};

	return (
		<CompactCard onClick={ recordAnalytics } href={ settingsLink }>
			{ site && <QuerySiteSettings siteId={ site.ID } /> }
			{ site && <QueryTerms siteId={ site.ID } taxonomy={ taxonomy } query={ {} } /> }
			<h2 className={ classes }>{ labels.name }</h2>
			{ ! isLoading && (
				<div className="taxonomies__card-content">
					<Gridicon icon="tag" size={ 18 } /> { count } { labels.name }
					{ defaultTerm && (
						<span>
							, { translate( 'default category:' ) } { decodeEntities( defaultTerm.name ) }
						</span>
					) }
				</div>
			) }
		</CompactCard>
	);
};

export default connect(
	( state, { taxonomy, postType } ) => {
		const siteId = getSelectedSiteId( state );
		const site = getSelectedSite( state );
		const labels = get( getPostTypeTaxonomy( state, siteId, postType, taxonomy ), 'labels', {} );
		const count = countFoundTermsForQuery( state, siteId, taxonomy, {} );
		const siteSettings = getSiteSettings( state, siteId );
		const hasDefaultTerm = taxonomy === 'category';
		const defaultTerm =
			hasDefaultTerm &&
			getTerm( state, siteId, taxonomy, get( siteSettings, [ 'default_category' ] ) );
		return {
			count,
			defaultTerm,
			labels,
			site,
		};
	},
	{ recordGoogleEvent, bumpStat }
)( localize( TaxonomyCard ) );
