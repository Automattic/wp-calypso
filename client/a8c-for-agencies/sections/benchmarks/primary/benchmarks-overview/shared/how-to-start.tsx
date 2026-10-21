import { __ } from '@wordpress/i18n';
import StepSection from 'calypso/a8c-for-agencies/components/step-section';
import StepSectionItem from 'calypso/a8c-for-agencies/components/step-section-item';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

type Props = {
	onSubmitClick: () => void;
};

export default function HowToStart( { onSubmitClick }: Props ) {
	const dispatch = useDispatch();

	const handleSubmitClick = () => {
		dispatch( recordTracksEvent( 'calypso_a4a_benchmarks_empty_state_submit_click' ) );
		onSubmitClick();
	};

	return (
		<StepSection heading={ __( 'How do I start?' ) }>
			<StepSectionItem
				heading={ __( 'Submit your first quarterly benchmark' ) }
				description={ __(
					'It only takes a few minutes. Your numbers are anonymized in every peer comparison.'
				) }
				buttonProps={ {
					primary: true,
					onClick: handleSubmitClick,
					children: __( 'Submit benchmark' ),
				} }
			/>
		</StepSection>
	);
}
