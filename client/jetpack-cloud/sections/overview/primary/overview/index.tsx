import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';

import './style.scss';

export default function Overview() {
	const translate = useTranslate();

	return (
		<div className="overview">
			<DocumentHead title={ translate( 'Overview' ) } />
			<Card className="overview__welcome">{ /*<OverviewWelcome />*/ }</Card>
			{ /*<Card className="overview__steps">*/ }
			{ /*	/!*<OverviewSteps />*!/*/ }
			{ /*</Card>*/ }
			{ /*<Card className="overview__tools">*/ }
			{ /*	/!*<OverviewTools />*!/*/ }
			{ /*</Card>*/ }
		</div>
	);
}
