import { translate } from 'i18n-calypso';
import * as React from 'react';
import SupportInfo from 'calypso/components/support-info';

interface Props {
	threatCount: number;
}

const ThreatLowRiskItemHeader: React.FC< Props > = ( { threatCount } ) => {
	return (
		<>
			{ translate(
				'Review %(threatCount)s low risk item',
				'Review %(threatCount)s low risk items',
				{ args: { threatCount: threatCount }, count: threatCount }
			) }
			<SupportInfo
				position="top"
				text={ translate(
					"Low risk items don't have a negative impact on your site and can be safely ignored."
				) }
			/>
		</>
	);
};

export default ThreatLowRiskItemHeader;
