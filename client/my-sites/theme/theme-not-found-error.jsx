import { useTranslate } from 'i18n-calypso';
import EmptyContent from 'calypso/components/empty-content';
import Main from 'calypso/components/main';

export default function ThemeNotFoundError() {
	const translate = useTranslate();

	const title = translate( 'Looking for great WordPress designs?', {
		comment: 'Message displayed when requested theme was not found',
	} );

	const line = translate( 'Check our theme showcase', {
		comment: 'Message displayed when requested theme was not found',
	} );

	return (
		<Main wideLayout>
			<EmptyContent
				title={ title }
				line={ line }
				action={ translate( 'View the showcase' ) }
				actionURL="/themes"
			/>
		</Main>
	);
}
