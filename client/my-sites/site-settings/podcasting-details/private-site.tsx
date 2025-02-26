import { localize, LocalizeProps } from 'i18n-calypso';
import * as React from 'react';
import { connect } from 'react-redux';
import { useRemoveDuplicateViewsExperimentEnabled } from 'calypso/lib/remove-duplicate-views-experiment';
import { IAppState } from 'calypso/state/types';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';

interface Props extends LocalizeProps {
	siteSlug: string;
	isComingSoon: boolean;
}

const PodcastingPrivateSiteMessage: React.FC< Props > = function PodcastingPrivateSiteMessage( {
	siteSlug,
	translate,
	isComingSoon,
}: Props ) {
	const isRemoveDuplicateViewsExperimentEnabled = useRemoveDuplicateViewsExperimentEnabled();

	const privacySettingsUrl = isRemoveDuplicateViewsExperimentEnabled
		? `/sites/settings/site/${ siteSlug }#site-privacy-settings`
		: `/settings/general/${ siteSlug }#site-privacy-settings`;

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
					'In order to enable podcasting, you must set the site visibility to {{strong}}Public{{/strong}} first.',
					{
						components: { strong: <strong /> },
						comment:
							'The translation for "Public" should match the strings on the Settings > General page.',
					}
				) }
			</p>
			<p>
				<a href={ privacySettingsUrl }>{ translate( 'Go to Privacy settings' ) }</a>
			</p>
		</div>
	);
};

export default connect( ( state: IAppState ) => {
	return {
		siteSlug: getSelectedSiteSlug( state ) ?? '',
	};
} )( localize( PodcastingPrivateSiteMessage ) );
