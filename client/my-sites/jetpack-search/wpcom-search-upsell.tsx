import {
	PLAN_BUSINESS,
	WPCOM_FEATURES_FULL_ACTIVITY_LOG,
	getPlan,
} from '@automattic/calypso-products';
import { Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import JetpackBackupSVG from 'calypso/assets/images/illustrations/jetpack-backup.svg';
import DocumentHead from 'calypso/components/data/document-head';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import Notice from 'calypso/components/notice';
import PromoSection, { Props as PromoSectionProps } from 'calypso/components/promo-section';
import PromoCard from 'calypso/components/promo-section/promo-card';
import PromoCardCTA from 'calypso/components/promo-section/promo-card/cta';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { preventWidows } from 'calypso/lib/formatting';
import useTrackCallback from 'calypso/lib/jetpack/use-track-callback';
import { useSelector } from 'calypso/state';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import './style.scss';

const SearchUpsellBody = () => {
	const siteSlug = useSelector( getSelectedSiteSlug );
	const siteId = useSelector( getSelectedSiteId );
	const isAdmin = useSelector(
		( state ) => siteId && canCurrentUser( state, siteId, 'manage_options' )
	);
	const translate = useTranslate();
	const onUpgradeClick = useTrackCallback( undefined, 'calypso_jetpack_search_business_upsell' );
	const hasFullActivityLogFeature = useSelector( ( state ) =>
		siteHasFeature( state, siteId, WPCOM_FEATURES_FULL_ACTIVITY_LOG )
	);
	const promos: PromoSectionProps = {
		promos: [
			{
				title: translate( 'Activity Log' ),
				body: translate(
					'A complete record of everything that happens on your site, with history that spans over 30 days.'
				),
				image: <Gridicon icon="history" className="backup__upsell-icon" />,
			},
		],
	};

	return (
		<>
			<PromoCard
				title={ preventWidows( translate( 'Title for Jetpack Search Upsell' ) ) }
				image={ { path: JetpackBackupSVG } }
				isPrimary
			>
				<p>{ preventWidows( translate( 'Jetpack Search text.' ) ) }</p>

				{ ! isAdmin && (
					<Notice
						status="is-warning"
						text={ translate( 'Only site administrators can upgrade to access Jetpack Search.' ) }
						showDismiss={ false }
					/>
				) }
				{ isAdmin && (
					<PromoCardCTA
						cta={ {
							text: translate( 'Upgrade to %(planName)s Plan', {
								args: { planName: getPlan( PLAN_BUSINESS )?.getTitle() ?? '' },
							} ),
							action: {
								url: `https://wordpress.com/checkout/${ siteSlug }/business`,
								onClick: onUpgradeClick,
								selfTarget: true,
							},
						} }
					/>
				) }
			</PromoCard>

			{ ! hasFullActivityLogFeature && (
				<>
					<h2 className="jetpack-search__subheader">
						{ translate( 'Also included in the %(planName)s Plan', {
							args: { planName: getPlan( PLAN_BUSINESS )?.getTitle() ?? '' },
						} ) }
					</h2>

					<PromoSection { ...promos } />
				</>
			) }
		</>
	);
};

export default function WPCOMUpsellPage() {
	const translate = useTranslate();
	return (
		<Main className="jetpack-search__main jetpack-search__wpcom-upsell">
			<DocumentHead title="Jetpack Search" />
			<PageViewTracker path="/jetpack-search/:site" title="Jetpack Search" />
			<NavigationHeader navigationItems={ [] } title={ translate( 'Jetpack Search' ) } />
			<SearchUpsellBody />
		</Main>
	);
}
