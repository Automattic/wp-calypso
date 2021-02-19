/**
 * External dependencies
 */
import React, { FunctionComponent, ReactNode } from 'react';
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
	secondaryButtonLink?: TranslateResult;
	secondaryButtonText?: TranslateResult;
	secondaryOnClick?: () => void;
}

const JetpackCloudUpsell: FunctionComponent< Props > = ( {
	bodyText,
	buttonLink,
	buttonText,
	headerText,
	iconComponent,
	onClick,
	secondaryButtonLink,
	secondaryButtonText,
	secondaryOnClick,
} ) => {
	const translate = useTranslate();

	return (
		<div className="upsell">
			{ iconComponent }
			<h2>{ headerText }</h2>
			<p>{ bodyText }</p>
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
			{ secondaryButtonLink && (
				<Button
					className="upsell__button"
					href={ secondaryButtonLink }
					onClick={ secondaryOnClick }
					target="_blank"
				>
					{ secondaryButtonText }
				</Button>
			) }
		</div>
	);
};

export default JetpackCloudUpsell;
