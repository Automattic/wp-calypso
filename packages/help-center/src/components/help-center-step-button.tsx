import { useTranslate } from 'i18n-calypso';
import HelpCenterInlineButton from './help-center-inline-button';
import type { FC } from 'react';

interface HelpCenterStepButtonProps {
	flowName?: string;
	helpCenterButtonCopy?: string;
	helpCenterButtonLink?: string;
}

const HelpCenterStepButton: FC< HelpCenterStepButtonProps > = ( {
	flowName,
	helpCenterButtonCopy,
	helpCenterButtonLink,
} ) => {
	const translate = useTranslate();

	return (
		<div className="step-wrapper__help-center-button-container">
			<label>{ helpCenterButtonCopy ?? translate( 'Need extra help?' ) }</label>{ ' ' }
			<HelpCenterInlineButton flowName={ flowName } className="step-wrapper__help-center-button">
				{ helpCenterButtonLink ?? translate( 'Visit Help Center' ) }
			</HelpCenterInlineButton>
		</div>
	);
};

export default HelpCenterStepButton;
