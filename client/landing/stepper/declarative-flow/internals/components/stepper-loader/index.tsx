import { isWooExpressFlow, isTransferringHostedSiteCreationFlow } from '@automattic/onboarding';
import { ProgressBar } from '@wordpress/components';
import { LoadingBar } from 'calypso/components/loading-bar';
import './style.scss';

interface StepperLoaderProps {
	title?: string;
	subtitle?: React.ReactNode;
	progress?: number;
	flow?: string;
}

const StepperLoader: React.FC< StepperLoaderProps > = ( {
	title,
	subtitle,
	progress = -1,
	flow = null,
} ) => {
	const renderProgressComponent = () => {
		if ( isWooExpressFlow( flow ) || isTransferringHostedSiteCreationFlow( flow ) ) {
			return (
				<LoadingBar
					progress={ progress >= 0 ? progress : -1 }
					className="processing-step__content woocommerce-install__content"
				/>
			);
		}

		return (
			<ProgressBar
				value={ progress >= 0 ? progress * 100 : undefined }
				className="stepper-loader__progress-bar processing-step__progress-bar"
			/>
		);
	};

	return (
		<div className="stepper-loader">
			<h1 className="stepper-loader__title processing-step__progress-step">{ title }</h1>
			{ renderProgressComponent() }
			{ subtitle && <p className="stepper-loader__subtitle">{ subtitle }</p> }
		</div>
	);
};

export default StepperLoader;
