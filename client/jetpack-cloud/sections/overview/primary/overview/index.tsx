import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';

import './style.scss';

export default function Overview() {
	const translate = useTranslate();

	return (
		<div className="overview">
			<DocumentHead title={ translate( 'Overview' ) } />
		</div>
	);
}
