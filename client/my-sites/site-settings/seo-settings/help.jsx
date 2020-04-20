/**
 * External dependencies
 */

import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import JetpackModuleToggle from 'my-sites/site-settings/jetpack-module-toggle';
import SettingsSectionHeader from 'my-sites/site-settings/settings-section-header';
import SupportInfo from 'components/support-info';
import { hasFeature } from 'state/sites/plans/selectors';
import { isJetpackSite } from 'state/sites/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { FEATURE_ADVANCED_SEO } from 'lib/plans/constants';

const SeoSettingsHelpCard = ( {
	disabled,
	hasAdvancedSEOFeature,
	siteId,
	siteIsJetpack,
	translate,
} ) => {
	const seoHelpLink = siteIsJetpack
		? 'https://jetpack.com/support/seo-tools/'
		: 'https://wpbizseo.wordpress.com/';

	return (
		<div id="seo">
			<SettingsSectionHeader title={ translate( 'Search engine optimization' ) } />
			{ hasAdvancedSEOFeature && (
				<Card className="seo-settings__help">
					<p>
						{ translate(
							'{{b}}WordPress.com has great SEO{{/b}} out of the box. All of our themes are optimized ' +
								"for search engines, so you don't have to do anything extra. However, you can tweak " +
								"these settings if you'd like more advanced control. Read more about what you can do " +
								"to {{a}}optimize your site's SEO{{/a}}.",
							{
								components: {
									a: <a href={ seoHelpLink } />,
									b: <strong />,
								},
							}
						) }
					</p>

					{ siteIsJetpack && (
						<SupportInfo
							text={ translate(
								'To help improve your search page ranking, you can customize how the content titles' +
									' appear for your site. You can reorder items such as ‘Site Name’ and ‘Tagline’,' +
									' and also add custom separators between the items.'
							) }
							link="https://jetpack.com/support/seo-tools/"
						/>
					) }
					{ siteIsJetpack && (
						<JetpackModuleToggle
							siteId={ siteId }
							moduleSlug="seo-tools"
							label={ translate( 'Enable SEO Tools to optimize your site for search engines' ) }
							disabled={ disabled }
						/>
					) }
				</Card>
			) }
		</div>
	);
};

export default connect( ( state ) => {
	const siteId = getSelectedSiteId( state );
	const siteIsJetpack = isJetpackSite( state, siteId );
	const hasAdvancedSEOFeature = hasFeature( state, siteId, FEATURE_ADVANCED_SEO );

	return {
		siteId,
		siteIsJetpack,
		hasAdvancedSEOFeature,
	};
} )( localize( SeoSettingsHelpCard ) );
