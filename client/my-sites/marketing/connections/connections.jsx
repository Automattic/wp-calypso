import { localize } from 'i18n-calypso';
import QueryKeyringConnections from 'calypso/components/data/query-keyring-connections';
import QueryKeyringServices from 'calypso/components/data/query-keyring-services';
import QueryP2Connections from 'calypso/components/data/query-p2-connections';
import QueryPublicizeConnections from 'calypso/components/data/query-publicize-connections';
import InlineSupportLink from 'calypso/components/inline-support-link';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import SharingServicesGroup from './services-group';

const SharingConnections = ( { translate, isP2Hub, siteId } ) => (
	<div className="connections__sharing-settings connections__sharing-connections">
		<PageViewTracker path="/marketing/connections/:site" title="Marketing > Connections" />

		{ isP2Hub && <QueryP2Connections siteId={ siteId } /> }
		{ ! isP2Hub && <QueryKeyringConnections /> }
		{ ! isP2Hub && <QueryPublicizeConnections selectedSite /> }
		{ ! isP2Hub && (
			<SharingServicesGroup
				type="publicize"
				title={ translate( 'Publicize posts {{learnMoreLink/}}', {
					components: {
						learnMoreLink: <InlineSupportLink supportContext="publicize" showText={ false } />,
					},
				} ) }
			/>
		) }

		<QueryKeyringServices />
		<SharingServicesGroup
			type="other"
			title={ translate( 'Manage connections' ) }
			numberOfPlaceholders={ isP2Hub ? 1 : undefined }
		/>
	</div>
);

export default localize( SharingConnections );
