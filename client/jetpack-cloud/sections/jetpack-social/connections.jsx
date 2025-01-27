import { Gridicon } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { translate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import QueryJetpackModules from 'calypso/components/data/query-jetpack-modules';
import QueryKeyringConnections from 'calypso/components/data/query-keyring-connections';
import QueryKeyringServices from 'calypso/components/data/query-keyring-services';
import QueryPublicizeConnections from 'calypso/components/data/query-publicize-connections';
import FormattedHeader from 'calypso/components/formatted-header';
import Main from 'calypso/components/main';
import SharingServicesGroup from 'calypso/sites/marketing/connections/services-group';
import { useSelector } from 'calypso/state';
import { isSimpleSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

import 'calypso/sites/marketing/style.scss';
import './style.scss';

export const Connections = () => {
	const siteId = useSelector( getSelectedSiteId );
	const isSimple = useSelector( ( state ) => isSimpleSite( state, siteId ) );

	const titleHeader = translate( 'Social Connections', {
		context: 'Title of the Jetpack Social connections page',
	} );

	const learnMoreLink = (
		<a
			href={ localizeUrl( 'https://jetpack.com/support/jetpack-social/' ) }
			className="connections__support-link"
			target="_blank"
			rel="noopener noreferrer"
		>
			<Gridicon icon="help-outline" size={ 16 } />
		</a>
	);

	return (
		// eslint-disable-next-line wpcalypso/jsx-classname-namespace
		<Main wideLayout className="connections__sharing-settings connections__sharing-connections">
			<DocumentHead title={ titleHeader } />
			<QueryKeyringConnections />
			<QueryKeyringServices />
			{ ! isSimple && siteId && <QueryJetpackModules siteId={ siteId } /> }
			{ siteId && <QueryPublicizeConnections siteId={ siteId } /> }
			<FormattedHeader
				className="connections__page-heading"
				headerText={ titleHeader }
				subHeaderText={ translate(
					'Connect to social media networks to drive more traffic to your site and increase your reach, engagement, and visibility.'
				) }
				align="left"
			/>
			<SharingServicesGroup
				type="publicize"
				title={ translate( 'Share posts with Jetpack Social {{learnMoreLink/}}', {
					components: { learnMoreLink },
				} ) }
			/>
		</Main>
	);
};

export default Connections;
