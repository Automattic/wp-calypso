/* eslint-disable react/no-danger  */

/**
 * External dependencies
 */
import React from 'react';
import { isArray } from 'lodash';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import { localize } from 'i18n-calypso';
import SectionHeader from 'components/section-header';
import { isValidTerm } from 'my-sites/themes/theme-filters';
import ThemesRelatedCard from '../../themes-related-card';
import ThemeDownloadCard from '../../theme-download-card';

const Description = ( { descriptionLong, description } ) => (
	<Card className="theme__sheet-content">
		{ descriptionLong
			? <div dangerouslySetInnerHTML={ { __html: descriptionLong } } />
			// description doesn't contain any formatting, so we don't need to dangerouslySetInnerHTML
			: <div>{ description }</div>
		}
	</Card>
);

const ThemeFeatures = ( { taxonomies, isJetpack, siteSlug } ) => (
	<div>
		{ taxonomies.theme_feature.map( function( item ) {
			const term = isValidTerm( item.slug ) ? item.slug : `feature:${ item.slug }`;
			return (
				<li key={ 'theme-features-item-' + item.slug }>
					{ isJetpack
						? <a>{ item.name }</a>
						: <a href={ `/design/filter/${ term }/${ siteSlug || '' }` }>{ item.name }</a>
					}
				</li>
			);
		} ) }
	</div>
);

const Features = localize(
	( { translate, isJetpack, siteSlug, taxonomies } ) => {
		if ( ! taxonomies || ! isArray( taxonomies.theme_feature ) ) {
			return null;
		}

		return (
			<div>
				<SectionHeader label={ translate( 'Features' ) } />
				<Card>
					<ul className="theme__sheet-features-list">
						<ThemeFeatures
							taxonomies={ taxonomies }
							isJetpack={ isJetpack }
							siteSlug={ siteSlug }
						/>
					</ul>
				</Card>
			</div>
		);
	}
);

const Download = ( { isPremium, isJetpack, download, id } ) => {
	// Don't render download button:
	// * If it's a premium theme
	// * If it's on a Jetpack site, and the theme object doesn't have a 'download' attr
	//   Note that not having a 'download' attr would be permissible for a theme on WPCOM
	//   since we don't provide any for some themes found on WordPress.org (notably the 'Twenties').
	//   The <ThemeDownloadCard /> component can handle that case.
	if ( isPremium || ( isJetpack && ! download ) ) {
		return null;
	}
	return <ThemeDownloadCard theme={ id } href={ download } />;
};


const Overview = ( { isJetpack, isPremium, id, siteSlug, theme } ) => (
	<div>
		<Description
			descriptionLong={ theme.descriptionLong }
			description={ theme.description }
		/>
		<Features
			isJetpack={ isJetpack }
			siteSlug={ siteSlug }
			taxonomies={ theme.taxonomies }
		/>
		<Download
			id={ id }
			isPremium={ isPremium }
			isJetpack={ isJetpack }
			download={ theme.download }
		/>
		{ ! isJetpack && <ThemesRelatedCard currentTheme={ id } /> }
	</div>
);

export default Overview;
