import { Badge } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import './style.scss';

export default function ThemeTierIncludedBadge() {
	const translate = useTranslate();

	return (
		<Badge type="info" className="theme-tier-included-label">
			{ translate( 'Included with plan' ) }
		</Badge>
	);
}
