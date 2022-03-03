import { Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { ReactElement } from 'react';
import './style.scss';

export default function (): ReactElement {
	const translate = useTranslate();

	return (
		<div className="assign-license-step-progress">
			<div className="assign-license-step-progress__step-complete">
				<span className="assign-license-step-progress__step-circle">
					<Gridicon icon="checkmark" />
				</span>
				<span className="assign-license-step-progress__step-name">
					{ translate( 'Issue new license' ) }
				</span>
			</div>
			<div className="assign-license-step-progress__step-separator" />
			<div className="assign-license-step-progress__step-current">
				<span className="assign-license-step-progress__step-circle">
					<span>2</span>
				</span>
				<span className="assign-license-step-progress__step-name">
					{ translate( 'Assign license' ) }
				</span>
			</div>
		</div>
	);
}
