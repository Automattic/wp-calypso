import { NoticeBanner } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';

export const NoPageFound = () => {
	const translate = useTranslate();

	return (
		<NoticeBanner level="warning" title={ translate( "That page wasn't found." ) } hideCloseButton>
			{ translate( 'Please search again or pick a page from the list of pages.' ) }
		</NoticeBanner>
	);
};
