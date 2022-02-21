import { translate } from 'i18n-calypso';
import * as React from 'react';
import InfoPopover from 'calypso/components/info-popover';

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
			<InfoPopover position="top" screenReaderText={ translate( 'Learn more' ) }>
				{ translate(
					"Low risk items don't have a negative impact on your site and can be safely ignored."
				) }
			</InfoPopover>
		</>
	);
};

export default ThreatLowRiskItemHeader;
