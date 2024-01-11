import { Button } from '@automattic/components';
import { useTranslate, TranslateResult } from 'i18n-calypso';
import { FunctionComponent, ReactNode } from 'react';

import './style.scss';

interface Props {
	bodyText: TranslateResult | ReactNode;
	buttonLink?: TranslateResult;
	buttonText?: TranslateResult;
	headerText: TranslateResult;
	iconComponent?: ReactNode;
	onClick?: () => void;
	openButtonLinkOnNewTab?: boolean;
	secondaryButtonLink?: TranslateResult;
	secondaryButtonText?: TranslateResult;
	secondaryOnClick?: () => void;
}

const JetpackCloudUpsell: FunctionComponent< Props > = ( {
	bodyText,
	buttonLink,
	buttonText,
	openButtonLinkOnNewTab = true,
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
			<h2 className="upsell__header-text">{ headerText }</h2>
			<p className="upsell__body-text">{ bodyText }</p>
			{ buttonLink && (
				<Button
					className="upsell__button"
					href={ String( buttonLink ) }
					onClick={ onClick }
					primary
					target={ openButtonLinkOnNewTab ? '_blank' : undefined }
				>
					{ buttonText || translate( 'Upgrade now' ) }
				</Button>
			) }
			{ secondaryButtonLink && (
				<Button
					className="upsell__button"
					href={ String( secondaryButtonLink ) }
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
