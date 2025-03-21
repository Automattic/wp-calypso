import { Step } from '@automattic/onboarding';
import { ProgressBar } from '@wordpress/components';
import clsx from 'clsx';
import './style.scss';

interface LoadingProps {
	title?: string | React.ReactNode;
	subtitle?: React.ReactNode;
	progress?: number;
	className?: string;
	useStepContainerV2?: boolean;
}

const Loading: React.FC< LoadingProps > = ( {
	title,
	subtitle,
	progress,
	className,
	useStepContainerV2,
} ) => {
	if ( useStepContainerV2 ) {
		return (
			<Step.FullWidthLayout
				topBar={ <Step.TopBar /> }
				heading={ <Step.Heading text={ title } size="small" align="center" /> }
				verticalAlign="center"
				className="step-container-v2--loading"
			>
				<ProgressBar className="step-container-v2--loading__progress-bar" value={ progress } />
			</Step.FullWidthLayout>
		);
	}

	return (
		<div className={ clsx( 'wpcom__loading', className ) }>
			<h1 className="wpcom__loading-title">{ title }</h1>
			<ProgressBar value={ progress } className="wpcom__loading-progress-bar" />
			{ subtitle && <p className="wpcom__loading-subtitle">{ subtitle }</p> }
		</div>
	);
};

export default Loading;
