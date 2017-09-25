/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import { get, isEmpty } from 'lodash';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import QueryThemeFilters from 'components/data/query-theme-filters';
import SectionHeader from 'components/section-header';
import { isValidThemeFilterTerm } from 'state/selectors';

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
					{ features.map( ( { name, slug, term } ) => (
						<li key={ 'theme-features-item-' + slug }>
							{ ! isWpcomTheme
								? <a>{ name }</a>
								: <a href={ `/themes/filter/${ term }/${ siteSlug || '' }` }>{ name }</a>
						}
						</li>
					) ) }
				</ul>
			</Card>
		</div>
	);
};

export default connect(
	( state, { taxonomies } ) => {
		const features = get( taxonomies, 'theme_feature', [] ).map( ( { name, slug } ) => {
			const term = isValidThemeFilterTerm( state, slug ) ? slug : `feature:${ slug }`;
			return { name, slug, term };
		} );
		return { features };
	}
)( localize( ThemeFeaturesCard ) );
