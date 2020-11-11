/**
 * External dependencies
 */
import React from 'react';
import { Button } from '@automattic/components';

/**
 * Type dependencies
 */
import type { MoreInfoProps } from 'calypso/my-sites/plans-v2/types.ts';

/**
 * Style dependencies
 */
import './style.scss';

const MoreInfoBox: React.FC< MoreInfoProps > = ( { headline, buttonLabel, onButtonClick } ) => (
	<div className="more-info-box__more-container">
		<h3 className="more-info-box__more-headline">{ headline }</h3>
		<Button onClick={ onButtonClick } className="more-info-box__more-button" primary>
			{ buttonLabel }
		</Button>
	</div>
);

export default MoreInfoBox;
