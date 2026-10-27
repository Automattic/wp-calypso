import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import NavigationHeader from 'calypso/components/navigation-header';
import Stream from 'calypso/reader/stream';
import EmptyContent from './empty';

interface SavedPostsStreamProps {
	streamKey: string;
	trackScrollPage: () => void;
	onUpdatesShown?: () => void;
}

const emptyContent = () => <EmptyContent />;

export default function SavedPostsStream( props: SavedPostsStreamProps ) {
	const translate = useTranslate();

	const title = translate( 'Saved' );
	const documentTitle = translate( '%s ‹ Reader', {
		args: title,
		comment: '%s is the section name. For example: "Saved"',
	} );

	return (
		<Stream { ...props } emptyContent={ emptyContent } showFollowInHeader>
			<DocumentHead title={ documentTitle } />
			<NavigationHeader title={ title } subtitle={ translate( 'Your reading list for later.' ) } />
		</Stream>
	);
}
