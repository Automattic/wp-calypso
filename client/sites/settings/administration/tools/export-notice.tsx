import { translate } from 'i18n-calypso';
import { MouseEvent } from 'react';
import Notice from 'calypso/components/notice';
import NoticeAction from 'calypso/components/notice/notice-action';

export default function ExportNotice( {
	siteId,
	siteSlug,
	warningText,
}: {
	siteId: number;
	siteSlug: string;
	warningText: string;
} ) {
	const checkSiteLoaded = ( event: MouseEvent< HTMLAnchorElement > ) => {
		if ( ! siteId ) {
			event.preventDefault();
		}
	};

	return (
		<Notice status="is-warning" showDismiss={ false } text={ warningText }>
			<NoticeAction onClick={ checkSiteLoaded } href={ `/export/${ siteSlug }` }>
				{ translate( 'Export content' ) }
			</NoticeAction>
		</Notice>
	);
}
