import { Card, Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { useSelector } from 'react-redux';
import QueryPlugins from 'calypso/components/data/query-plugins';
import { getPluginOnSite } from 'calypso/state/plugins/installed/selectors';
import { getSiteDomain, getSiteAdminUrl } from 'calypso/state/sites/selectors';

export const JetpackFediverseSettingsSection = ( { siteId } ) => {
	const translate = useTranslate();
	const domain = useSelector( ( state ) => getSiteDomain( state, siteId ) );
	const plugin = useSelector( ( state ) => getPluginOnSite( state, siteId, 'activitypub' ) );
	const adminUrl = useSelector( ( state ) =>
		getSiteAdminUrl( state, siteId, 'options-general.php?page=activitypub' )
	);
	const pluginIsActive = plugin?.active;

	return (
		<>
			<QueryPlugins siteId={ siteId } />
			<Card className="site-settings__card">
				<p>
					{ translate(
						'With ActivityPub your blog becomes part of a federated social network. This means you can share and talk to everyone using the ActivityPub protocol, including users of Mastodon, Friendica, and Pleroma.'
					) }
				</p>
				<p>
					{ translate(
						'Allow people on the fediverse to follow your site, receive updates, and leave comments.'
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
						<Button primary={ true } onClick={ () => page( `/plugins/activitypub/${ domain }` ) }>
							{ translate( 'Install ActivityPub' ) }
						</Button>
					) }
				</p>
			</Card>
		</>
	);
};
