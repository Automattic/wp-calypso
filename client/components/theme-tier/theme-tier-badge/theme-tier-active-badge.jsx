import { Badge } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';

export default function ThemeTierActiveBadge() {
	const translate = useTranslate();

	return (
		<Badge type="info" className="theme-tier-active-label">
			{ translate( 'Active', {
				context: 'singular noun, the currently active theme',
			} ) }
		</Badge>
	);
}
