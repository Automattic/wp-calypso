import { Badge } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';

export default function ThemeActiveBadge() {
	const translate = useTranslate();

	return (
		<Badge className="theme__sheet-active-badge" type="info">
			{ translate( 'Active', {
				context: 'singular noun, the currently active theme',
			} ) }
		</Badge>
	);
}
