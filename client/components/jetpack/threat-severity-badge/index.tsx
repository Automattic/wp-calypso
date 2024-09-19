import clsx from 'clsx';
import { translate } from 'i18n-calypso';

import './style.scss';

const severityClassNames = ( severity: number ) => {
	return {
		'is-critical': severity >= 5,
		'is-high': severity >= 3 && severity < 5,
		'is-low': severity < 3,
	};
};

const severityText = ( severity: number ) => {
	if ( severity >= 5 ) {
		return translate( 'Critical' );
	}

	if ( severity >= 3 ) {
		return translate( 'High' );
	}

	return translate( 'Low' );
};

const ThreatSeverityBadge = ( { severity }: { severity: number } ) => {
	return (
		<div className="threat-severity-badge__wrapper">
			<div className={ clsx( 'threat-severity-badge__content', severityClassNames( severity ) ) }>
				{ severityText( severity ) }
			</div>
		</div>
	);
};

export default ThreatSeverityBadge;
