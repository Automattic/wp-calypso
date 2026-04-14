import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import NavigationHeader from 'calypso/components/navigation-header';
import ReaderMain from 'calypso/reader/components/reader-main';
import { useSelector } from 'calypso/state';
import { getSavedPostsCount } from 'calypso/state/reader/saved/selectors';
import EmptyContent from './empty';

import './style.scss';

export default function SavedPostsStream() {
	const translate = useTranslate();
	const count = useSelector( getSavedPostsCount );

	const title = translate( 'Saved' );
	const documentTitle = translate( '%s ‹ Reader', {
		args: title,
		comment: '%s is the section name. For example: "Saved"',
	} );

	const subtitle = translate( 'Your reading list for later.' );

	return (
		<ReaderMain className="saved-stream">
			<DocumentHead title={ documentTitle } />
			<NavigationHeader title={ title } subtitle={ subtitle } />
			{ count === 0 ? (
				<EmptyContent />
			) : (
				<div className="saved-stream__list">
					{ /* Phase 4: SavedPostsList with drag-and-drop will go here */ }
				</div>
			) }
		</ReaderMain>
	);
}
