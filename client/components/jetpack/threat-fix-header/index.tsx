import { Gridicon } from '@automattic/components';
import clsx from 'clsx';
import { translate } from 'i18n-calypso';
import { useState } from 'react';
import FormInputCheckbox from 'calypso/components/forms/form-checkbox';
import { Threat } from 'calypso/components/jetpack/threat-item/types';
import { getThreatFix, getThreatMessage } from 'calypso/components/jetpack/threat-item/utils';
import ThreatSeverityBadge from 'calypso/components/jetpack/threat-severity-badge';

import './style.scss';

interface Props {
	threat: Threat;
	fixAllDialog?: boolean;
	onCheckFix?: ( checked: boolean, threat: Threat ) => void;
	action: 'fix' | 'ignore';
}

export default function ThreatFixHeader( { threat, fixAllDialog, onCheckFix, action }: Props ) {
	const [ checkedFix, setCheckedFix ] = useState( true );

	const checkFix = ( event: { target: { checked: boolean } } ) => {
		setCheckedFix( event.target.checked );
		onCheckFix?.( event.target.checked, threat );
	};

	const severityClassNames = ( severity: number ) => {
		return {
			'is-critical': severity >= 5,
			'is-high': severity >= 3 && severity < 5,
			'is-low': severity < 3,
		};
	};

	return (
		<>
			<ThreatSeverityBadge severity={ threat.severity } />
			<div className="threat-fix-header__card-container">
				<div className="threat-fix-header__card-top">{ getThreatMessage( threat ) }</div>
				<span
					className={ clsx(
						'threat-fix-header__card-bottom',
						severityClassNames( threat.severity )
					) }
				>
					<Gridicon className="threat-fix-header__warning-icon" icon="info-outline" size={ 18 } />
					{ action === 'fix' && threat.fixable && getThreatFix( threat.fixable ) }
					{ action === 'ignore' && translate( 'Jetpack will ignore the threat.' ) }
				</span>
			</div>
			<div className="threat-fix-header__autofix-checkbox">
				{ fixAllDialog && (
					<FormInputCheckbox checked={ checkedFix } onChange={ checkFix } value={ threat.id } />
				) }
			</div>
		</>
	);
}
