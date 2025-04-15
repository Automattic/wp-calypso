import clsx from 'clsx';
import { StepContainerV2 } from '../../components/StepContainerV2/StepContainerV2';
import { ContentProp } from '../../components/StepContainerV2/context';
import { TopBarRenderer } from '../../components/TopBar/TopBarRenderer';

import './style.scss';

interface PlaygroundLayoutProps {
	topBar?: ContentProp;
	className?: string;
	children?: ContentProp;
}

export const PlaygroundLayout = ( { topBar, className, children }: PlaygroundLayoutProps ) => {
	return (
		<StepContainerV2>
			{ ( context ) => {
				const content = typeof children === 'function' ? children( context ) : children;

				return (
					<>
						<TopBarRenderer topBar={ topBar } />
						<div className={ clsx( 'step-container-v2__playground-layout', className ) }>
							{ content }
						</div>
					</>
				);
			} }
		</StepContainerV2>
	);
};
