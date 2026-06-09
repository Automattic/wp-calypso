import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import NavigationHeader from 'calypso/components/navigation-header';
import ReaderMain from 'calypso/reader/components/reader-main';

export function SpacesView() {
	const translate = useTranslate();

	return (
		<ReaderMain className="reader-spaces">
			<DocumentHead title={ translate( 'Spaces ‹ Reader' ) } />
			<NavigationHeader title={ translate( 'Spaces' ) } />
		</ReaderMain>
	);
}

export default SpacesView;
