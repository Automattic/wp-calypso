import { Badge } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';

export default function ThemeTierFreeBadge() {
	const translate = useTranslate();

	return <Badge type="info">{ translate( 'Free' ) }</Badge>;
}
