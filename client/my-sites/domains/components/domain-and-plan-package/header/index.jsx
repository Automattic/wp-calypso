import { useTranslate } from 'i18n-calypso';

import './style.scss';

export default function DomainAndPlanPackageHeader() {
	const translate = useTranslate();

	return (
		<div>
			<span>{ translate( 'Back to Sites' ) }</span>
		</div>
	);
}
