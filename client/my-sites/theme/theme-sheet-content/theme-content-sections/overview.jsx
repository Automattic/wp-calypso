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
import ThemesRelatedCard from '../themes-related-card';
import ThemeDownloadCard from '../theme-download-card';

const DescriptionLong = ( description ) =>
	<div dangerouslySetInnerHTML={ { __html: description } } />;

// description doesn't contain any formatting, so we don't need to dangerouslySetInnerHTML
const Description = ( description ) =>
	<div>{ description }</div>;

const ThemeFeatures = ( taxonomies, isJetpack, siteSlug ) => (
	taxonomies.theme_feature.map( function( item ) {
		const term = isValidTerm( item.slug ) ? item.slug : `feature:${ item.slug }`;
		return (
			<li key={ 'theme-features-item-' + item.slug }>
				{ isJetpack
					? <a>{ item.name }</a>
					: <a href={ `/design/filter/${ term }/${ siteSlug || '' }` }>{ item.name }</a>
				}
			</li>
		);
	} )
);

const Features = localize(
	( isJetpack, siteSlug, taxonomies, translate ) => {
		if ( ! taxonomies && ! isArray( taxonomies.theme_feature ) ) {
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

const Download = ( props ) => {
	const { isPremium, isJetpack, theme, id } = props;
	// Don't render download button:
	// * If it's a premium theme
	// * If it's on a Jetpack site, and the theme object doesn't have a 'download' attr
	//   Note that not having a 'download' attr would be permissible for a theme on WPCOM
	//   since we don't provide any for some themes found on WordPress.org (notably the 'Twenties').
	//   The <ThemeDownloadCard /> component can handle that case.
	if ( isPremium || ( isJetpack && ! theme.download ) ) {
		return null;
	}
	return <ThemeDownloadCard theme={ id } href={ theme.download } />;
};

const Overview = ( { descriptionLong, description, isJetpack, isPremium, id, taxonomies, siteSlug, theme } ) => (
	<div>
		<Card className="theme__sheet-content">
			{ descriptionLong
				? <DescriptionLong description={ descriptionLong } />
				: <Description description={ description } />
			}
		</Card>
		<Features
			isJetpack={ isJetpack }
			siteSlug={ siteSlug }
			taxonomies={ taxonomies }
		/>
		<Download
			id={ id }
			isPremium={ isPremium }
			isJetpack={ isJetpack }
			theme={ theme }
		/>
		{ ! isJetpack && <ThemesRelatedCard currentTheme={ id } /> }
	</div>
);

export default Overview;
