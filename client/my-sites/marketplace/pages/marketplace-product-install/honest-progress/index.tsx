import './style.scss';

import { useTranslate } from 'i18n-calypso';
import HonestFooter from './footer';
import StageList from './stage-list';
import { useHonestProgress } from './use-honest-progress';

export default function HonestInstallProgress( {
	transferStatus,
	currentStep,
	startedAt,
}: {
	transferStatus: string | null;
	currentStep: number;
	startedAt?: number | null;
} ) {
	const translate = useTranslate();
	const { stage, elapsed, isOverrun, getStageProgress } = useHonestProgress( {
		transferStatus,
		currentStep,
		startedAt,
	} );

	return (
		<div className="marketplace-honest-progress">
			<h1 className="marketplace-honest-progress__heading wp-brand-font">
				{ translate( 'Setting up your plugin' ) }
			</h1>
			<StageList stage={ stage } getStageProgress={ getStageProgress } />
			<HonestFooter elapsed={ elapsed } isOverrun={ isOverrun } />
		</div>
	);
}
