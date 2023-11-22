import { useTranslate } from 'i18n-calypso';

interface MagicLoginEmailContentProps {
	name: string;
}

export function MagicLoginEmailContent( { name }: MagicLoginEmailContentProps ) {
	const translate = useTranslate();
	return (
		<p>
			{ translate( 'Open in ' ) } { name }
		</p>
	);
}
