/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize, LocalizeProps } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { getSelectedSiteSlug } from 'state/ui/selectors';

interface Props extends LocalizeProps {
	siteSlug: string;
	isComingSoon: boolean;
}

const PodcastingPrivateSiteMessage: React.FC< Props > = function PodcastingPrivateSiteMessage( {
	siteSlug,
	translate,
	isComingSoon,
}: Props ) {
	return (
		<div className="podcasting-details__private-site">
			<p>
				{ isComingSoon
					? translate(
							"This site's visibility is currently set to {{strong}}Coming Soon{{/strong}}.",
							{
								components: { strong: <strong /> },
								comment:
									'The translation for "Coming Soon" should match the string on the Settings > General page.',
							}
					  )
					: translate( "This site's visibility is currently set to {{strong}}Private{{/strong}}.", {
							components: { strong: <strong /> },
							comment:
								'The translation for "Private" should match the string on the Settings > General page.',
					  } ) }
			</p>
			<p>
				{ translate(
					'In order to enable podcasting, you must set the site visibility to {{strong}}Public{{/strong}} or {{strong}}Hidden{{/strong}} first.',
					{
						components: { strong: <strong /> },
						comment:
							'The translations for "Public" and "Hidden" should match the strings on the Settings > General page.',
					}
				) }
			</p>
			<p>
				<a href={ '/settings/general/' + siteSlug + '#site-privacy-settings' }>
					{ translate( 'Go to Privacy settings' ) }
				</a>
			</p>
		</div>
	);
};

export default connect( ( state ) => {
	return {
		siteSlug: getSelectedSiteSlug( state ),
	};
} )( localize( PodcastingPrivateSiteMessage ) );
