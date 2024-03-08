import { useTranslate } from 'i18n-calypso';

interface MagicLoginEmailContentProps {
	mailProviderName: string;
}

export function MagicLoginEmailContent( { mailProviderName }: MagicLoginEmailContentProps ) {
	const translate = useTranslate();
	return <p>{ translate( 'Open in %(mailProviderName)s', { args: { mailProviderName } } ) }</p>;
}
