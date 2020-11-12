/**
 * External dependencies
 */
import React from 'react';
import { Button } from '@automattic/components';

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
	onButtonClick: () => void;
};

const MoreInfoBox: React.FC< MoreInfoProps > = ( { headline, buttonLabel, onButtonClick } ) => (
	<div className="more-info-box__more-container">
		<h3 className="more-info-box__more-headline">{ headline }</h3>
		<Button onClick={ onButtonClick } className="more-info-box__more-button" primary>
			{ buttonLabel }
		</Button>
	</div>
);

export default MoreInfoBox;
