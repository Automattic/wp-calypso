import { useTranslate } from 'i18n-calypso';
import EmptyContent from 'calypso/components/empty-content';
import Main from 'calypso/components/main';

const JetpackAppEmptyContent: React.FC = () => {
	const translate = useTranslate();

	return (
		<Main>
			<EmptyContent
				illustration="/calypso/images/illustrations/illustration-404.svg"
				title={ translate( 'Uh oh. Page not found.' ) }
				line={ translate(
					"Sorry, the page you were looking for doesn't exist or has been moved."
				) }
			/>
		</Main>
	);
};

export default JetpackAppEmptyContent;
