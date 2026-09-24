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

	let visibility;
	if ( isSitePrivate ) {
		visibility = translate( 'Your SEO settings won’t apply while your site is Private.' );
	} else if ( siteIsComingSoon ) {
		visibility = translate( 'Your SEO settings won’t apply while your site is Coming Soon.' );
	} else {
		visibility = translate(
			'Your SEO settings won’t apply while your site discourages search engines from indexing it.'
		);
	}

	return (
		<Notice.Root className="seo-settings__visibility-notice" intent="warning">
			<Notice.Title>{ translate( 'Your site may not appear in search results' ) }</Notice.Title>
			<Notice.Description>
				{ visibility }{ ' ' }
				{ translate(
					'Update your {{a}}site visibility settings{{/a}} to let search engines index it.',
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
