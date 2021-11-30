import { Gridicon } from '@automattic/components';
import classnames from 'classnames';
import { useState } from 'react';
import FormInputCheckbox from 'calypso/components/forms/form-checkbox';
import { FixableThreat } from 'calypso/components/jetpack/threat-item-new/types';
import { getThreatFix, getThreatMessage } from 'calypso/components/jetpack/threat-item-new/utils';
import ThreatSeverityBadge from 'calypso/components/jetpack/threat-severity-badge';

import './style.scss';

interface Props {
	threat: FixableThreat;
	fixAllDialog?: bool;
	onCheckFix?: callable;
}

export default function ThreatFixHeader( { threat, fixAllDialog, onCheckFix } ): React.FC< Props > {
	const [ checkedFix, setCheckedFix ] = useState( true );

	const checkFix = ( event ) => {
		setCheckedFix( event.target.checked );
		onCheckFix( event.target.checked, threat );
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
					className={ classnames(
						'threat-fix-header__card-bottom',
						severityClassNames( threat.severity )
					) }
				>
					<Gridicon className="threat-fix-header__warning-icon" icon="info-outline" size={ 18 } />
					{ getThreatFix( threat.fixable ) }
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
