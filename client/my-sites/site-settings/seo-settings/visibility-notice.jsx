import { FEATURE_ADVANCED_SEO } from '@automattic/calypso-products';
import { Link, Notice } from '@wordpress/ui';
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

	let title;
	if ( isSitePrivate ) {
		title = translate(
			"SEO settings aren't recognized by search engines while your site is Private."
		);
	} else if ( siteIsComingSoon ) {
		title = translate(
			"SEO settings aren't recognized by search engines while your site is Coming Soon."
		);
	} else {
		title = translate(
			"SEO settings aren't recognized by search engines while your site is Hidden."
		);
	}

	return (
		<Notice.Root className="seo-settings__visibility-notice" intent="warning">
			<Notice.Title>{ title }</Notice.Title>
			<Notice.Description>
				{ translate(
					'Your site is not currently accessible to search engines. You must set your {{a}}privacy settings{{/a}} to “public”.',
					{
						components: {
							a: <Link href={ `/sites/settings/site/${ siteSlug }` } />,
						},
					}
				) }
			</Notice.Description>
		</Notice.Root>
	);
}
