import { Link, Notice } from '@wordpress/ui';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import isPrivateSite from 'calypso/state/selectors/is-private-site';
import isSiteComingSoon from 'calypso/state/selectors/is-site-coming-soon';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';

export default function SeoVisibilityNotice() {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( getSelectedSiteSlug );
	const isSitePrivate = useSelector( ( state ) => isPrivateSite( state, siteId ) );
	const siteIsComingSoon = useSelector( ( state ) => isSiteComingSoon( state, siteId ) );

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
