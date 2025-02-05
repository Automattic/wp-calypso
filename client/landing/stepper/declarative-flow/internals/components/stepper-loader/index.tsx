import { ProgressBar } from '@wordpress/components';
import clsx from 'clsx';
import './style.scss';

interface StepperLoaderProps {
	title?: string;
	subtitle?: React.ReactNode;
	progress?: number;
	className?: string;
}

const StepperLoader: React.FC< StepperLoaderProps > = ( {
	title,
	subtitle,
	progress = -1,
	className,
} ) => {
	const renderProgressComponent = () => {
		return (
			<ProgressBar
				value={ progress >= 0 ? progress * 100 : undefined }
				className="stepper-loader__progress-bar processing-step__progress-bar"
			/>
		);
	};

	return (
		<div className={ clsx( 'stepper-loader', className ) }>
			<h1 className="stepper-loader__title processing-step__progress-step">{ title }</h1>
			{ renderProgressComponent() }
			{ subtitle && <p className="stepper-loader__subtitle">{ subtitle }</p> }
		</div>
	);
};

export default StepperLoader;
