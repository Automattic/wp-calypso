import { translate } from 'i18n-calypso';
import { MouseEvent } from 'react';
import Notice from 'calypso/components/notice';
import NoticeAction from 'calypso/components/notice/notice-action';

export default function ExportNotice( {
	siteId,
	siteSlug,
	warningText,
	isClassicView,
	siteAdminUrl,
}: {
	siteId: number;
	siteSlug: string;
	warningText: string;
	isClassicView?: boolean;
	siteAdminUrl?: string | null;
} ) {
	const checkSiteLoaded = ( event: MouseEvent< HTMLAnchorElement > ) => {
		if ( ! siteId ) {
			event.preventDefault();
		}
	};

	const exportHref =
		isClassicView && siteAdminUrl ? `${ siteAdminUrl }export.php` : `/export/${ siteSlug }`;

	return (
		<Notice status="is-warning" showDismiss={ false } text={ warningText }>
			<NoticeAction onClick={ checkSiteLoaded } href={ exportHref }>
				{ translate( 'Export content' ) }
			</NoticeAction>
		</Notice>
	);
}
