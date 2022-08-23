import { useTranslate } from 'i18n-calypso';

export function useTranslateFlowName( flow: string | null ): string {
	const translate = useTranslate();

	switch ( flow ) {
		case 'newsletter':
			return translate( 'Newsletter' );
			break;
		case 'link-in-bio':
			return translate( 'Link in Bio' );
			break;
		case 'podcast':
			return translate( 'Podcast' );
			break;
		default:
			return translate( 'Website' );
	}
}
