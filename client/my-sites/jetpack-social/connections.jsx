import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import QueryJetpackModules from 'calypso/components/data/query-jetpack-modules';
import QueryPublicizeConnections from 'calypso/components/data/query-publicize-connections';
import FormattedHeader from 'calypso/components/formatted-header';
import InlineSupportLink from 'calypso/components/inline-support-link';
import Main from 'calypso/components/main';
import SharingServicesGroup from 'calypso/my-sites/marketing/connections/services-group';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

import '../marketing/style.scss';
import './style.scss';

export const Connections = ( { siteId, translate } ) => {
	const titleHeader = translate( 'Social' );

	return (
		// eslint-disable-next-line wpcalypso/jsx-classname-namespace
		<Main wideLayout className="connections__sharing-settings connections__sharing-connections">
			<DocumentHead title={ titleHeader } />
			{ siteId && <QueryJetpackModules siteId={ siteId } /> }
			{ siteId && <QueryPublicizeConnections siteId={ siteId } /> }
			<FormattedHeader
				brandFont
				className="connections__page-heading"
				headerText={ titleHeader }
				subHeaderText={ translate( 'Manage your connections to social media networks' ) }
				align="left"
			/>
			<SharingServicesGroup
				type="publicize"
				title={ translate( 'Publicize posts {{learnMoreLink/}}', {
					components: {
						learnMoreLink: <InlineSupportLink supportContext="publicize" showText={ false } />,
					},
				} ) }
			/>
		</Main>
	);
};

export default connect( ( state ) => {
	return {
		siteId: getSelectedSiteId( state ),
	};
} )( localize( Connections ) );
