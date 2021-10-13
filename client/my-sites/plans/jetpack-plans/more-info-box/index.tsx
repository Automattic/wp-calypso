import { Button, Gridicon } from '@automattic/components';
import * as React from 'react';
import useTrackCallback from 'calypso/lib/jetpack/use-track-callback';
import { PLAN_COMPARISON_PAGE } from 'calypso/my-sites/plans/jetpack-plans/constants';
import type { TranslateResult } from 'i18n-calypso';
import type { ReactNode } from 'react';

import './style.scss';

type MoreInfoProps = {
	headline: TranslateResult;
	buttonLabel: TranslateResult | ReactNode;
	onButtonClick?: () => void;
};

const MoreInfoBox: React.FC< MoreInfoProps > = ( { headline, buttonLabel } ) => {
	const onClick = useTrackCallback( undefined, 'calypso_plans_comparison_table_link_click' );

	return (
		<div className="more-info-box__more-container">
			<h3 className="more-info-box__more-headline">{ headline }</h3>
			<Button
				onClick={ onClick }
				href={ PLAN_COMPARISON_PAGE }
				target="_blank"
				className="more-info-box__more-button"
			>
				{ buttonLabel }
				<Gridicon className="more-info-box__icon" icon="external" />
			</Button>
		</div>
	);
};

export default MoreInfoBox;
