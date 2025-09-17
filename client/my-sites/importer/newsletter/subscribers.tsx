import { useI18n } from '@wordpress/react-i18n';
import ImporterActionButton from '../importer-action-buttons/action-button';
import StepDone from './subscribers/step-done';
import StepImporting from './subscribers/step-importing';
import StepInitial from './subscribers/step-initial';
import StepPending from './subscribers/step-pending';
import { SubscribersStepProps } from './types';

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
