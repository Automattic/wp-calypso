import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import VertoComponent from 'calypso/verto/main';

export function verto( context, next ) {
	const VertoTitle = () => {
		const translate = useTranslate();

		return <DocumentHead title={ translate( 'Calypso Agentic Framework', { textOnly: true } ) } />;
	};

	context.primary = (
		<>
			<VertoTitle />
			<VertoComponent path={ context.path } />
		</>
	);
	next();
}
