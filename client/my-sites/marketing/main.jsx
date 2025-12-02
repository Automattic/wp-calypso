import { PLAN_PERSONAL, WPCOM_FEATURES_NO_ADVERTS, getPlan } from '@automattic/calypso-products';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import UpsellNudge from 'calypso/blocks/upsell-nudge';
import DocumentHead from 'calypso/components/data/document-head';
import QueryJetpackModules from 'calypso/components/data/query-jetpack-modules';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import isSiteP2Hub from 'calypso/state/selectors/is-site-p2-hub';
import isVipSite from 'calypso/state/selectors/is-vip-site';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import 'calypso/sites/marketing/style.scss';

export const Sharing = ( {
	contentComponent,
	pathname,
	siteId,
	isJetpack,
	isP2Hub,
	isVip,
	translate,
} ) => {
	let titleHeader = translate( 'Marketing and Integrations' );

	if ( isP2Hub ) {
		titleHeader = translate( 'Integrations' );
	}

	const showNoAdsUpsell = pathname.startsWith( '/marketing/tools' );

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
			{ showNoAdsUpsell && ! isVip && ! isJetpack && (
				<UpsellNudge
					event="sharing_no_ads"
					plan={ PLAN_PERSONAL }
					feature={ WPCOM_FEATURES_NO_ADVERTS }
					description={ translate( 'Prevent ads from showing on your site.' ) }
					title={ translate( 'No ads with WordPress.com %(upsellPlanName)s', {
						args: { upsellPlanName: getPlan( PLAN_PERSONAL )?.getTitle() },
					} ) }
					tracksImpressionName="calypso_upgrade_nudge_impression"
					tracksClickName="calypso_upgrade_nudge_cta_click"
					showIcon
				/>
			) }
			{ contentComponent }
		</Main>
	);
};

Sharing.propTypes = {
	contentComponent: PropTypes.node,
	isVip: PropTypes.bool,
	pathname: PropTypes.string,
	siteId: PropTypes.number,
	translate: PropTypes.func,
};

export default connect( ( state ) => {
	const siteId = getSelectedSiteId( state );
	const isJetpack = isJetpackSite( state, siteId );

	return {
		isP2Hub: isSiteP2Hub( state, siteId ),
		isVip: isVipSite( state, siteId ),
		siteId,
		isJetpack: isJetpack,
	};
} )( localize( Sharing ) );
