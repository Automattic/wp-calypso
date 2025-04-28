import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import CustomizeComponent from 'calypso/my-sites/customize/main';

export function customize( context, next ) {
	const CustomizeTitle = () => {
		const translate = useTranslate();

		return <DocumentHead title={ translate( 'Customizer', { textOnly: true } ) } />;
	};

	context.primary = (
		<>
			<CustomizeTitle />
			<CustomizeComponent
				domain={ context.params.domain || '' }
				pathname={ context.pathname }
				prevPath={ context.previousPath || '' }
				query={ context.query }
				panel={ context.params.panel }
			/>
		</>
	);

	next();
}
