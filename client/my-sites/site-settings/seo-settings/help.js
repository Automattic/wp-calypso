/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import SectionHeader from 'components/section-header';
import { hasFeature } from 'state/sites/plans/selectors';
import { isJetpackSite } from 'state/sites/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { FEATURE_ADVANCED_SEO } from 'lib/plans/constants';

const SeoSettingsHelpCard = ( {
	hasAdvancedSEOFeature,
	siteIsJetpack,
	translate
} ) => {
	const seoHelpLink = siteIsJetpack
		? 'https://jetpack.com/support/seo-tools/'
		: 'https://en.blog.wordpress.com/2013/03/22/seo-on-wordpress-com/';

	return (
		<div>
			<SectionHeader label={ translate( 'Search engine optimization' ) } />
			{
				hasAdvancedSEOFeature &&
				<Card>
					<p>
						{ translate(
							'{{b}}WordPress.com has great SEO{{/b}} out of the box. All of our themes are optimized ' +
							'for search engines, so you don\'t have to do anything extra. However, you can tweak ' +
							'these settings if you\'d like more advanced control. Read more about what you can do ' +
							'to {{a}}optimize your site\'s SEO{{/a}}.',
							{
								components: {
									a: <a href={ seoHelpLink } />,
									b: <strong />
								}
							}
						) }
					</p>
				</Card>
			}
		</div>
	);
};

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const siteIsJetpack = isJetpackSite( state, siteId );
		const hasAdvancedSEOFeature = hasFeature( state, siteId, FEATURE_ADVANCED_SEO );

		return {
			siteIsJetpack,
			hasAdvancedSEOFeature
		};
	}
)( localize( SeoSettingsHelpCard ) );
