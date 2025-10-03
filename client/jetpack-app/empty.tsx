import { useTranslate, fixMe } from 'i18n-calypso';
import EmptyContent from 'calypso/components/empty-content';
import Main from 'calypso/components/main';

const JetpackAppEmptyContent: React.FC = () => {
	const translate = useTranslate();

	return (
		<Main>
			<EmptyContent
				title={ fixMe( {
					text: 'Page not found.',
					newCopy: translate( 'Page not found.' ),
					oldCopy: translate( 'Uh oh. Page not found.' ),
				} ) }
				line={ translate(
					"Sorry, the page you were looking for doesn't exist or has been moved."
				) }
			/>
		</Main>
	);
};

export default JetpackAppEmptyContent;
