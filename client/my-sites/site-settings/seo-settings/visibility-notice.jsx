import { FEATURE_ADVANCED_SEO } from '@automattic/calypso-products';
import { Notice } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import isHiddenSite from 'calypso/state/selectors/is-hidden-site';
import isPrivateSite from 'calypso/state/selectors/is-private-site';
import isSiteComingSoon from 'calypso/state/selectors/is-site-coming-soon';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

export default function SeoVisibilityNotice() {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) );
	const showAdvancedSeo = useSelector( ( state ) =>
		siteHasFeature( state, siteId, FEATURE_ADVANCED_SEO )
	);
	const isSitePrivate = useSelector( ( state ) => isPrivateSite( state, siteId ) );
	const isSiteHidden = useSelector( ( state ) => isHiddenSite( state, siteId ) );
	const siteIsComingSoon = useSelector( ( state ) => isSiteComingSoon( state, siteId ) );

	if ( ! showAdvancedSeo || ! ( isSitePrivate || isSiteHidden ) ) {
		return null;
	}

	let text;
	if ( isSitePrivate ) {
		text = translate(
			"SEO settings aren't recognized by search engines while your site is Private."
		);
	} else if ( siteIsComingSoon ) {
		text = translate(
			"SEO settings aren't recognized by search engines while your site is Coming Soon."
		);
	} else {
		text = translate(
			"SEO settings aren't recognized by search engines while your site is Hidden."
		);
	}

	return (
		<Notice
			className="seo-settings__visibility-notice"
			status="warning"
			isDismissible={ false }
			actions={ [
				{
					label: translate( 'Privacy Settings', { context: 'Site visibility settings' } ),
					url: `/sites/settings/site/${ siteSlug }`,
				},
			] }
		>
			{ text }
		</Notice>
	);
}
