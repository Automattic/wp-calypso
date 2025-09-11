import { PLAN_PERSONAL, WPCOM_FEATURES_NO_ADVERTS, getPlan } from '@automattic/calypso-products';
import { localize } from 'i18n-calypso';
import { find } from 'lodash';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import UpsellNudge from 'calypso/blocks/upsell-nudge';
import DocumentHead from 'calypso/components/data/document-head';
import QueryJetpackModules from 'calypso/components/data/query-jetpack-modules';
import InlineSupportLink from 'calypso/components/inline-support-link';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import SectionNav from 'calypso/components/section-nav';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';
import { useSelector } from 'calypso/state';
import isSiteP2Hub from 'calypso/state/selectors/is-site-p2-hub';
import isVipSite from 'calypso/state/selectors/is-vip-site';
import { getSiteSlug, isAdminInterfaceWPAdmin, isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import 'calypso/sites/marketing/style.scss';

export const Sharing = ( {
	contentComponent,
	pathname,
	showConnections,
	siteId,
	isJetpack,
	isP2Hub,
	isVip,
	siteSlug,
	translate,
} ) => {
	const adminInterfaceIsWPAdmin = useSelector( ( state ) =>
		isAdminInterfaceWPAdmin( state, siteId )
	);

	const pathSuffix = siteSlug ? '/' + siteSlug : '';
	let filters = [];

	filters.push( {
		id: 'marketing-tools',
		route: '/marketing/tools' + pathSuffix,
		title: translate( 'Marketing Tools' ),
	} );

	// Include Connections link if all sites are selected. Otherwise,
	// verify that the required Jetpack module is active
	const connectionsFilter = {
		id: 'sharing-connections',
		route: '/marketing/connections' + pathSuffix,
		title: translate( 'Connections' ),
		description: translate(
			'Connect your site to social networks and other services. {{learnMoreLink/}}',
			{
				components: {
					learnMoreLink: (
						<InlineSupportLink key="publicize" supportContext="publicize" showIcon={ false } />
					),
				},
			}
		),
	};
	if ( showConnections ) {
		filters.push( connectionsFilter );
	}

	let titleHeader = translate( 'Marketing and Integrations' );

	if ( adminInterfaceIsWPAdmin ) {
		titleHeader = translate( 'Marketing' );
	}

	if ( isP2Hub ) {
		// For p2 hub sites show only connections tab.
		filters = [ connectionsFilter ];
		titleHeader = translate( 'Integrations' );
	}

	const selected = find( filters, { route: pathname } );
	const isFirstFilterSelected = filters[ 0 ]?.route === pathname;

	const showFilters = filters.length > 0 && ! pathname.startsWith( '/marketing/sharing-buttons' );

	return (
		// eslint-disable-next-line wpcalypso/jsx-classname-namespace
		<Main wideLayout className="sharing">
			<DocumentHead title={ titleHeader } />
			{ siteId && <QueryJetpackModules siteId={ siteId } /> }
			<NavigationHeader
				navigationItems={ [] }
				title={ titleHeader }
				subtitle={
					selected?.description ??
					translate(
						'Explore tools to build your audience, market your site, and engage your visitors.'
					)
				}
			/>
			{ showFilters && (
				<SectionNav selectedText={ selected?.title ?? '' }>
					<NavTabs>
						{ filters.map( ( { id, route, isExternalLink, title } ) => (
							<NavItem
								key={ id }
								path={ route }
								isExternalLink={ isExternalLink }
								selected={ pathname === route }
							>
								{ title }
							</NavItem>
						) ) }
					</NavTabs>
				</SectionNav>
			) }
			{ isFirstFilterSelected && ! isVip && ! isJetpack && (
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
	canManageOptions: PropTypes.bool,
	contentComponent: PropTypes.node,
	isVipSite: PropTypes.bool,
	path: PropTypes.string,
	showConnections: PropTypes.bool,
	siteId: PropTypes.number,
	siteSlug: PropTypes.string,
	translate: PropTypes.func,
};

export default connect( ( state ) => {
	const siteId = getSelectedSiteId( state );
	const isJetpack = isJetpackSite( state, siteId );

	return {
		isP2Hub: isSiteP2Hub( state, siteId ),
		showConnections: !! siteId,
		isVip: isVipSite( state, siteId ),
		siteId,
		siteSlug: getSiteSlug( state, siteId ),
		isJetpack: isJetpack,
	};
} )( localize( Sharing ) );
