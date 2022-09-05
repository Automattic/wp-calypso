import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button, Gridicon } from '@automattic/components';
import classNames from 'classnames';
import * as React from 'react';
import type { TranslateResult } from 'i18n-calypso';
import type { ReactNode } from 'react';

import './style.scss';

type MoreInfoProps = {
	buttonLabel: TranslateResult | ReactNode;
	buttonLink: string;
	className?: string;
	trackEventName: string;
};

const MoreInfoBox: React.FC< MoreInfoProps > = ( {
	buttonLabel,
	buttonLink,
	className,
	trackEventName,
} ) => (
	<Button
		onClick={ () => recordTracksEvent( trackEventName ) }
		href={ buttonLink }
		target="_blank"
		rel="noreferrer noopener"
		className={ classNames( 'more-info-box__more-button is-external', className ) }
	>
		{ buttonLabel }
		<Gridicon className="more-info-box__icon" icon="external" />
	</Button>
);

export default MoreInfoBox;
