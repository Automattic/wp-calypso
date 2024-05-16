import page from '@automattic/calypso-router';
import { Card, Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import QueryPlugins from 'calypso/components/data/query-plugins';
import { getPluginOnSite } from 'calypso/state/plugins/installed/selectors';
import { getSiteDomain, getSiteAdminUrl } from 'calypso/state/sites/selectors';

function Wrapper( { children, needsCard } ) {
	return needsCard ? <Card ClassName="site-settings__card">{ children }</Card> : children;
}

export const JetpackFediverseSettingsSection = ( { siteId, needsBorders } ) => {
	const translate = useTranslate();
	const domain = useSelector( ( state ) => getSiteDomain( state, siteId ) );
	const plugin = useSelector( ( state ) => getPluginOnSite( state, siteId, 'activitypub' ) );
	const adminUrl = useSelector( ( state ) =>
		getSiteAdminUrl( state, siteId, 'options-general.php?page=activitypub' )
	);
	const pluginIsActive = plugin?.active;
	const pluginIsInstalledAndInactive = plugin && ! pluginIsActive;

	return (
		<>
			<QueryPlugins siteId={ siteId } />
			<Wrapper needsCard={ needsBorders }>
				<p>
					{ translate(
						'Broadcast your blog into the fediverse! Attract followers, deliver updates, and receive comments from a diverse user base of ActivityPub-compliant platforms.'
					) }
				</p>
				<p>
					{ pluginIsActive ? (
						<>
							<strong>{ translate( 'ActivityPub is already enabled for your site!' ) }</strong>
							<p>
								{ translate( '{{link}}Manage ActivityPub settings{{/link}}', {
									components: {
										link: <a href={ adminUrl } />,
									},
								} ) }
							</p>
						</>
					) : (
						<Button primary onClick={ () => page( `/plugins/activitypub/${ domain }` ) }>
							{ pluginIsInstalledAndInactive
								? translate( 'Activate ActivityPub' )
								: translate( 'Install ActivityPub' ) }
						</Button>
					) }
				</p>
			</Wrapper>
		</>
	);
};
