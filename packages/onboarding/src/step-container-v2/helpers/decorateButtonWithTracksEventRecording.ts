import { Onboard, OnboardSelect } from '@automattic/data-stores';
import { Button } from '@wordpress/components';
import { select } from '@wordpress/data';
import { ComponentProps } from 'react';
import { StepContainerV2ContextType } from '../contexts/StepContainerV2Context';

export const decorateButtonWithTracksEventRecording = (
	{ onClick, ...props }: ComponentProps< typeof Button >,
	{
		tracksEventName,
		stepContext,
	}: { tracksEventName: string; stepContext: StepContainerV2ContextType }
): ComponentProps< typeof Button > => {
	const onClickHandler = (
		event: React.MouseEvent< HTMLAnchorElement, MouseEvent > &
			React.MouseEvent< HTMLButtonElement, MouseEvent >
	) => {
		onClick?.( event );

		stepContext?.recordTracksEvent?.( tracksEventName, {
			flow: stepContext?.flowName,
			step: stepContext?.stepName,
			intent: ( select( Onboard.register() ) as OnboardSelect ).getIntent(),
		} );
	};

	return { ...props, onClick: onClickHandler };
};
