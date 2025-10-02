import { useI18n } from '@wordpress/react-i18n';
import ImporterActionButton from '../../importer-action-buttons/action-button';
import { SubscribersStepProps } from '../types';
import StepDone from './step-done';
import StepImporting from './step-importing';
import StepInitial from './step-initial';
import StepPending from './step-pending';

export default function Subscribers( stepProps: SubscribersStepProps ) {
	const { __ } = useI18n();

	const actionButton = (
		<ImporterActionButton
			onClick={ () => stepProps.onViewSummaryClick?.() }
			{ ...( stepProps.nextStepUrl && { href: stepProps.nextStepUrl } ) }
		>
			{ __( 'View summary' ) }
		</ImporterActionButton>
	);

	switch ( stepProps.status ) {
		case 'pending':
			return <StepPending { ...stepProps } onStartImport={ stepProps.skipNextStep } />;
		case 'importing':
			return <StepImporting { ...stepProps } actionButton={ actionButton } />;
		case 'done':
			return <StepDone { ...stepProps } actionButton={ actionButton } />;
	}

	return <StepInitial { ...stepProps } />;
}
