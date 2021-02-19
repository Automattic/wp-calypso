/**
 * External dependencies
 */

import React from 'react';
import { connect } from 'react-redux';
import { get, isEmpty } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import QueryThemeFilters from 'calypso/components/data/query-theme-filters';
import SectionHeader from 'calypso/components/section-header';
import { isValidThemeFilterTerm } from 'calypso/state/themes/selectors';

const ThemeFeaturesCard = ( { isWpcomTheme, siteSlug, features, translate } ) => {
	if ( isEmpty( features ) ) {
		return null;
	}

	return (
		<div>
			<QueryThemeFilters />
			<SectionHeader label={ translate( 'Features' ) } />
			<Card>
				<ul className="theme__sheet-features-list">
					{ features.map( ( { name, slug, term } ) => (
						<li key={ 'theme-features-item-' + slug }>
							{ ! isWpcomTheme ? (
								<a>{ name }</a>
							) : (
								<a href={ `/themes/filter/${ term }/${ siteSlug || '' }` }>{ name }</a>
							) }
						</li>
					) ) }
				</ul>
			</Card>
		</div>
	);
};

export default connect( ( state, { taxonomies } ) => {
	const features = get( taxonomies, 'theme_feature', [] ).map( ( { name, slug } ) => {
		const term = isValidThemeFilterTerm( state, slug ) ? slug : `feature:${ slug }`;
		return { name, slug, term };
	} );
	return { features };
} )( localize( ThemeFeaturesCard ) );
