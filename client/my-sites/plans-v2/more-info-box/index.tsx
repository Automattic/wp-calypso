/**
 * External dependencies
 */
import React from 'react';
import { Button } from '@automattic/components';

/**
 * Internal dependencies
 */
import useTrackCallback from 'calypso/lib/jetpack/use-track-callback';
import { PLAN_COMPARISON_PAGE } from 'calypso/my-sites/plans-v2/constants';
import Gridicon from 'calypso/components/gridicon';

/**
 * Type dependencies
 */
import type { TranslateResult } from 'i18n-calypso';
import type { ReactNode } from 'react';

/**
 * Style dependencies
 */
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
