import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import NavigationHeader from 'calypso/components/navigation-header';
import ReaderMain from 'calypso/reader/components/reader-main';
import type { JSX } from 'react';

import './style.scss';

export default function ReaderFollowSitesPage(): JSX.Element {
	const translate = useTranslate();

	return (
		<ReaderMain className="follow-sites">
			<DocumentHead title={ translate( 'Follow sites' ) } />
			<NavigationHeader
				className="follow-sites__header"
				title={ translate( 'Follow your favorite websites' ) }
				subtitle={ translate( 'Search by name, paste a link, or add an RSS feed.' ) }
			/>
			<div className="follow-sites__content"></div>
		</ReaderMain>
	);
}
