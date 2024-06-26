import { useTranslate } from 'i18n-calypso';

export default function EmptyState() {
	const translate = useTranslate();
	return (
		<div className="licenses-overview__empty-message">{ translate( 'No licenses found.' ) }</div>
	);
}
