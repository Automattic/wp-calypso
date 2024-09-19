import { useTranslate } from 'i18n-calypso';
import { Badge } from '../../../.';

import './style.scss';

const BadgeNew = () => {
	const translate = useTranslate();

	return (
		<Badge type="success" className="stats-card__badge--success">
			{ translate( 'New' ) }
		</Badge>
	);
};

export default BadgeNew;
