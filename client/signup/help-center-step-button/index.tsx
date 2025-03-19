import { HelpCenterInlineButton } from '@automattic/help-center';
import { useTranslate } from 'i18n-calypso';
import useShouldRenderHelpCenterButton from './use-should-render-help-center-button';
import type { FC } from 'react';

interface HelpCenterStepButtonProps {
	flowName: string;
	enabledGeos?: string[];
	helpCenterButtonCopy?: string;
	helpCenterButtonLink?: string;
}

const HelpCenterStepButton: FC< HelpCenterStepButtonProps > = ( {
	flowName,
	enabledGeos,
	helpCenterButtonCopy,
	helpCenterButtonLink,
} ) => {
	const translate = useTranslate();

	const shouldRenderHelpCenterButton = useShouldRenderHelpCenterButton( { flowName, enabledGeos } );

	if ( ! shouldRenderHelpCenterButton ) {
		return null;
	}

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
