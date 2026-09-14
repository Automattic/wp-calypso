import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import QueryJetpackModules from 'calypso/components/data/query-jetpack-modules';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import isSiteP2Hub from 'calypso/state/selectors/is-site-p2-hub';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import 'calypso/sites/marketing/style.scss';

export const Sharing = ( { contentComponent, siteId, isP2Hub, translate } ) => {
	let titleHeader = translate( 'Marketing and Integrations' );

	if ( isP2Hub ) {
		titleHeader = translate( 'Integrations' );
	}

	return (
		// eslint-disable-next-line wpcalypso/jsx-classname-namespace
		<Main wideLayout className="sharing">
			<DocumentHead title={ titleHeader } />
			{ siteId && <QueryJetpackModules siteId={ siteId } /> }
			<NavigationHeader
				navigationItems={ [] }
				title={ titleHeader }
				subtitle={ translate(
					'Explore tools to build your audience, market your site, and engage your visitors.'
				) }
			/>
			{ contentComponent }
		</Main>
	);
};

Sharing.propTypes = {
	contentComponent: PropTypes.node,
	siteId: PropTypes.number,
	translate: PropTypes.func,
};

export default connect( ( state ) => {
	const siteId = getSelectedSiteId( state );

	return {
		isP2Hub: isSiteP2Hub( state, siteId ),
		siteId,
	};
} )( localize( Sharing ) );
