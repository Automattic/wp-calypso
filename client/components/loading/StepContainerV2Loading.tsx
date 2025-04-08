import { Step } from '@automattic/onboarding';
import { type ReactNode, useEffect, useState } from 'react';

export const StepContainerV2Loading = ( {
	title,
	progress,
	delay = 0,
}: {
	title?: ReactNode;
	progress?: number;
	delay?: number;
} ) => {
	const [ shouldDisplayTitle, setShouldDisplayTitle ] = useState( delay === 0 );

	useEffect( () => {
		const timeout = setTimeout( () => {
			setShouldDisplayTitle( true );
		}, delay );

		return () => clearTimeout( timeout );
	}, [ delay ] );

	return <Step.Loading title={ shouldDisplayTitle ? title : undefined } progress={ progress } />;
};
