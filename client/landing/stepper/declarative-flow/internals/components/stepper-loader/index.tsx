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
	progress,
	className,
} ) => {
	return (
		<div className={ clsx( 'stepper-loader', className ) }>
			<h1 className="stepper-loader__title">{ title }</h1>
			<ProgressBar value={ progress } className="stepper-loader__progress-bar" />
			{ subtitle && <p className="stepper-loader__subtitle">{ subtitle }</p> }
		</div>
	);
};

export default StepperLoader;
