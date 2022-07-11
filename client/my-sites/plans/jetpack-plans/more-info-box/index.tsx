import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button, Gridicon } from '@automattic/components';
import * as React from 'react';
import type { TranslateResult } from 'i18n-calypso';
import type { ReactNode } from 'react';

import './style.scss';

type MoreInfoProps = {
	buttonLabel: TranslateResult | ReactNode;
	buttonLink: string;
	trackEventName: string;
};

const MoreInfoBox: React.FC< MoreInfoProps > = ( { buttonLabel, buttonLink, trackEventName } ) => (
	<Button
		onClick={ () => recordTracksEvent( trackEventName ) }
		href={ buttonLink }
		target="_blank"
		rel="noreferrer"
		className="more-info-box__more-button"
	>
		{ buttonLabel }
		<Gridicon className="more-info-box__icon" icon="external" />
	</Button>
);

export default MoreInfoBox;
