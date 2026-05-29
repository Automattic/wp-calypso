import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import DeveloperComponent from 'calypso/me/developer/main';

export function developer( context, next ) {
	const DeveloperTitle = () => {
		const translate = useTranslate();

		return <DocumentHead title={ translate( 'Developer Features', { textOnly: true } ) } />;
	};

	context.primary = (
		<>
			<DeveloperTitle />
			<DeveloperComponent path={ context.path } />
		</>
	);
	next();
}
