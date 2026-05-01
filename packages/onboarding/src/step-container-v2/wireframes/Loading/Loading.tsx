import { ProgressBar } from '@wordpress/components';
import { ReactNode, useEffect, useState } from 'react';
import { Heading } from '../../components/Heading/Heading';
import { StepContainerV2 } from '../../components/StepContainerV2/StepContainerV2';
import { TopBar, type TopBarProps } from '../../components/TopBar/TopBar';

import './style.scss';

interface LoadingProps {
	title?: ReactNode;
	subtitle?: ReactNode;
	progress?: number;
	delay?: number;
	compactLogo?: TopBarProps[ 'compactLogo' ];
	topBarRightElement?: TopBarProps[ 'rightElement' ];
}

export const Loading = ( {
	title,
	subtitle,
	progress,
	delay = 0,
	compactLogo,
	topBarRightElement,
}: LoadingProps ) => {
	const [ shouldDisplayTitle, setShouldDisplayTitle ] = useState( delay === 0 );

	const [ prevDelay, setPrevDelay ] = useState( delay );
	if ( delay !== prevDelay ) {
		setPrevDelay( delay );
		setShouldDisplayTitle( delay === 0 );
	}

	useEffect( () => {
		if ( delay === 0 ) {
			return;
		}

		const timeout = setTimeout( () => {
			setShouldDisplayTitle( true );
		}, delay );

		return () => clearTimeout( timeout );
	}, [ delay ] );

	return (
		<StepContainerV2>
			<TopBar compactLogo={ compactLogo } rightElement={ topBarRightElement } />
			<div className="step-container-v2--loading">
				{ title && shouldDisplayTitle && (
					<div className="step-container-v2--loading__heading-wrapper">
						<div className="step-container-v2--loading__heading">
							<Heading text={ title } size="small" align="center" />
						</div>
					</div>
				) }
				<ProgressBar className="step-container-v2--loading__progress-bar" value={ progress } />
				{ subtitle && (
					<div className="step-container-v2--loading__subtitle-wrapper">
						<p className="step-container-v2--loading__subtitle">{ subtitle }</p>
					</div>
				) }
			</div>
		</StepContainerV2>
	);
};
