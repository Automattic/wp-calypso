import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import Main from 'calypso/components/main';

export default function Overview() {
	const translate = useTranslate();

	return (
		<Main className="manage-overview">
			<DocumentHead title={ translate( 'Overview' ) } />
		</Main>
	);
}
