/**
 * External dependencies
 */
import React from 'react';
import { isArray } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import SectionHeader from 'components/section-header';
import { isValidTerm } from 'my-sites/themes/theme-filters';

const ThemeFeaturesCard = ( { isWpcomTheme, siteSlug, taxonomies, translate } ) => {
	if ( ! taxonomies || ! isArray( taxonomies.theme_feature ) ) {
		return null;
	}

	const themeFeatures = taxonomies.theme_feature.map( function( item ) {
		const term = isValidTerm( item.slug ) ? item.slug : `feature:${ item.slug }`;
		return (
			<li key={ 'theme-features-item-' + item.slug }>
				{ ! isWpcomTheme
					? <a>{ item.name }</a>
					: <a href={ `/themes/filter/${ term }/${ siteSlug || '' }` }>{ item.name }</a>
			}
			</li>
		);
	} );

	return (
		<div>
			<SectionHeader label={ translate( 'Features' ) } />
			<Card>
				<ul className="theme__sheet-features-list">
					{ themeFeatures }
				</ul>
			</Card>
		</div>
	);
};

export default localize( ThemeFeaturesCard );
