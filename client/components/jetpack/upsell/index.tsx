/**
 * External dependencies
 */
import React, { FunctionComponent, isValidElement, ReactNode } from 'react';
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
	bodyText: TranslateResult | ReactNode;
	buttonLink?: TranslateResult;
	buttonText?: TranslateResult;
	headerText: TranslateResult;
	iconComponent?: ReactNode;
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
			{ isValidElement( bodyText ) ? { bodyText } : <p>{ bodyText }</p> }
			{ buttonLink && (
				<Button
					className="upsell__button"
					href={ buttonLink }
					onClick={ onClick }
					primary
					target="_blank"
				>
					{ buttonText || translate( 'Upgrade now' ) }
				</Button>
			) }
		</div>
	);
};

export default JetpackCloudUpsell;
