import config from '@automattic/calypso-config';
import { WPCOM_FEATURES_CDN, WPCOM_FEATURES_CLOUDFLARE_CDN } from '@automattic/calypso-products';
import { CompactCard } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useDispatch, useSelector } from 'react-redux';
import cloudflareIllustration from 'calypso/assets/images/illustrations/cloudflare-logo-small.svg';
import jetpackIllustration from 'calypso/assets/images/illustrations/jetpack-logo.svg';
import UpsellNudge from 'calypso/blocks/upsell-nudge';
import SettingsSectionHeader from 'calypso/my-sites/site-settings/settings-section-header';
import { composeAnalytics, recordTracksEvent } from 'calypso/state/analytics/actions';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';

const Cloudflare = () => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const showCloudflare = config.isEnabled( 'cloudflare' );
	const siteId = useSelector( ( state ) => getSelectedSiteId( state ) ) || 0;
	const siteSlug = useSelector( ( state ) => getSelectedSiteSlug( state, siteId ) );
	const hasCloudflareCDN = useSelector( ( state ) =>
		siteHasFeature( state, siteId, WPCOM_FEATURES_CLOUDFLARE_CDN )
	);
	const hasJetpackCDN = useSelector( ( state ) =>
		siteHasFeature( state, siteId, WPCOM_FEATURES_CDN )
	);
	const upgradeLink = `/plans/${ siteSlug }?customerType=business`;

	const recordClick = () => {
		dispatch(
			composeAnalytics( recordTracksEvent( 'calypso_performance_settings_cloudflare_click' ) )
		);
	};

	return (
		<>
			{ showCloudflare && (
				<>
					<SettingsSectionHeader title={ translate( 'CDN' ) } />
					<CompactCard>
						<div className="site-settings__cloudflare">
							<div className="site-settings__cloudflare-illustration">
								<img src={ jetpackIllustration } alt="" />
							</div>
							<div className="site-settings__cloudflare-text">
								<p className="site-settings__cloudflare-title">
									{ translate( 'Jetpack Site Accelerator' ) }
								</p>
								<p>{ translate( 'Comes built-in with WordPress.com Business plans.' ) }</p>
								<p>
									<a
										onClick={ recordClick }
										href="https://jetpack.com/features/design/content-delivery-network/"
										target="_blank"
										rel="noreferrer"
									>
										{ translate( 'Learn more' ) }
									</a>
								</p>
							</div>
						</div>
					</CompactCard>
					{ ! hasJetpackCDN && (
						<UpsellNudge
							title={ translate( 'Available on Business plan or higher' ) }
							href={ upgradeLink }
							event={ 'calypso_settings_cloudflare_cdn_upsell_nudge_click' }
							showIcon={ true }
							forceDisplay
						/>
					) }
					<CompactCard>
						<div className="site-settings__cloudflare">
							<div className="site-settings__cloudflare-illustration">
								<img src={ cloudflareIllustration } alt="" />
							</div>
							<div className="site-settings__cloudflare-text">
								<p className="site-settings__cloudflare-title">
									{ translate( 'Cloudflare CDN ' ) }
								</p>
								<p>
									{ translate(
										'An alternative to Jetpack CDN, with security-focused plans available for sites with a custom domain enabled.'
									) }
								</p>
								<p>
									<a
										onClick={ recordClick }
										href="https://www.cloudflare.com/pg-lp/cloudflare-for-wordpress-dot-com?utm_source=wordpress.com&utm_medium=affiliate&utm_campaign=paygo_2021-02_a8_pilot&utm_content=site-settings"
										target="_blank"
										rel="noreferrer"
									>
										{ translate( 'Learn more' ) }
									</a>
								</p>
							</div>
						</div>
					</CompactCard>
					{ ! hasCloudflareCDN && (
						<UpsellNudge
							title={ translate( 'Available with Premium plans or higher' ) }
							description={ translate(
								'A CDN (Content Delivery Network) optimizes your content to provide users with the fastest experience.'
							) }
							href={ upgradeLink }
							event={ 'calypso_settings_cloudflare_cdn_upsell_nudge_click' }
							showIcon={ true }
							forceDisplay
						/>
					) }
					<div className="site-settings__cloudflare-spacer" />
				</>
			) }
		</>
	);
};

export default Cloudflare;
