import { Button, Gridicon } from '@automattic/components';
import * as React from 'react';
import useTrackCallback from 'calypso/lib/jetpack/use-track-callback';
import type { TranslateResult } from 'i18n-calypso';
import type { ReactNode } from 'react';

import './style.scss';

type MoreInfoProps = {
	buttonLabel: TranslateResult | ReactNode;
	buttonLink: string;
	track: string;
};

const MoreInfoBox: React.FC< MoreInfoProps > = ( { buttonLabel, buttonLink, track } ) => {
	const onClick = useTrackCallback( undefined, track );

	return (
		<Button
			onClick={ onClick }
			href={ buttonLink }
			target="_blank"
			rel="noreferrer"
			className="more-info-box__more-button"
		>
			{ buttonLabel }
			<Gridicon className="more-info-box__icon" icon="external" />
		</Button>
	);
};

export default MoreInfoBox;
