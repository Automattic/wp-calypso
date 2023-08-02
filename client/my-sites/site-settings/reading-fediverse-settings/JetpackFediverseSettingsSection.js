import { Card, Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { useSelector } from 'react-redux';
import QueryPlugins from 'calypso/components/data/query-plugins';
import { getPluginOnSite } from 'calypso/state/plugins/installed/selectors';
import { getSiteDomain } from 'calypso/state/sites/selectors';

export const JetpackFediverseSettingsSection = ( { siteId } ) => {
	const translate = useTranslate();
	const domain = useSelector( ( state ) => getSiteDomain( state, siteId ) );
	const plugin = useSelector( ( state ) => getPluginOnSite( state, siteId, 'activitypub' ) );
	const pluginIsActive = plugin?.active;

	return (
		<>
			<QueryPlugins siteId={ siteId } />
			<Card className="site-settings__card">
				<p>
					The fediverse is a network of social media sites like Mastodon and Pixelfed and Firefish
					and Peertube and Pleroma, oh my!
				</p>
				<p>
					Your site can publish to the same ActivityPub protocol that powers all of them, just
					install the ActivityPub plugin:
				</p>
				<p>
					{ pluginIsActive ? (
						<strong>{ translate( 'ActivityPub is already enabled for your site!' ) }</strong>
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
