import { useTranslate } from 'i18n-calypso';

import './style.scss';

export default function DomainAndPlanPackageHeader() {
	const translate = useTranslate();

	return (
		<div class="domain-and-plan-package-header">
			<div class="domain-and-plan-package-header__back">
				<span>{ translate( 'Back to Sites' ) }</span>
			</div>
			<div class="domain-and-plan-package-header__steps">
				<span>1. Domain 2. Plan 3. Purchase</span>
			</div>
		</div>
	);
}
