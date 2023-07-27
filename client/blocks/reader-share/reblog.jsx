import { useTranslate } from 'i18n-calypso';
import page from 'page';
import SiteSelector from 'calypso/components/site-selector';
import ReaderPopoverMenu from 'calypso/reader/components/reader-popover/menu';
import * as stats from 'calypso/reader/stats';
import { useSelector } from 'calypso/state';
import getPrimarySiteId from 'calypso/state/selectors/get-primary-site-id';

const ReaderReblogSelection = ( props ) => {
	const hasSites = !! useSelector( getPrimarySiteId );
	const translate = useTranslate();

	const buildQuerystringForPost = ( post ) => {
		const args = {};

		if ( post.content_embeds && post.content_embeds.length ) {
			args.embed = post.content_embeds[ 0 ].embedUrl || post.content_embeds[ 0 ].src;
		}

		args.title = `${ post.title } — ${ post.site_name }`;
		args.text = post.excerpt;
		args.url = post.URL;
		args.is_post_share = true; // There is a dependency on this here https://github.com/Automattic/wp-calypso/blob/a69ded693a99fa6a957b590b1a538f32a581eb8a/client/gutenberg/editor/controller.js#L209

		const params = new URLSearchParams( args );
		return params.toString();
	};

	const pickSiteToShareTo = ( slug ) => {
		stats.recordAction( 'share_wordpress' );
		stats.recordGaEvent( 'Clicked on Share to WordPress' );
		stats.recordTrack( 'calypso_reader_share_to_site' );
		page( `/post/${ slug }?` + buildQuerystringForPost( props.post ) );
		return true;
	};

	return (
		hasSites && (
			<ReaderPopoverMenu { ...props.popoverProps } popoverTitle={ translate( 'Reblog on' ) }>
				<SiteSelector
					className="reader-share__site-selector"
					onSiteSelect={ pickSiteToShareTo }
					groups
				/>
			</ReaderPopoverMenu>
		)
	);
};

export default ReaderReblogSelection;
