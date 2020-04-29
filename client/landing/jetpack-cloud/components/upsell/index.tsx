/**
 * External dependencies
 */
import React, { FunctionComponent, ReactChild } from 'react';
import { useTranslate, TranslateResult } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';

/**
 * Style dependencies
 */
import './style.scss';

interface Props {
	bodyText: TranslateResult;
	buttonLink: TranslateResult;
	buttonText?: TranslateResult;
	headerText: TranslateResult;
	iconComponent: ReactChild;
	onClick?: () => void;
}

const JetpackCloudUpsell: FunctionComponent< Props > = ( {
	bodyText,
	buttonLink,
	buttonText,
	headerText,
	iconComponent,
	onClick,
} ) => {
	const translate = useTranslate();

	return (
		<div className="upsell">
			{ iconComponent }
			<h2>{ headerText }</h2>
			<p>{ bodyText }</p>
			<Button
				className="upsell__button"
				href={ buttonLink }
				onClick={ onClick }
				primary
				target="_blank"
			>
				{ buttonText || translate( 'Upgrade now' ) }
			</Button>
		</div>
	);
};

export default JetpackCloudUpsell;
