import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useEffect } from 'react';
import StepSection from 'calypso/a8c-for-agencies/components/step-section';
import StepSectionItem from 'calypso/a8c-for-agencies/components/step-section-item';
import useHelpCenter from 'calypso/a8c-for-agencies/hooks/use-help-center';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

// TODO: replace with the published benchmarks Knowledge Base URL once Marketing has one.
const BENCHMARKS_KNOWLEDGE_BASE_URL =
	'https://agencieshelp.automattic.com/knowledge-base/agency-benchmarks/';

type Props = {
	onSubmitClick: () => void;
};

export default function BenchmarksEmptyState( { onSubmitClick }: Props ) {
	const dispatch = useDispatch();
	const { showSupportGuide } = useHelpCenter();

	useEffect( () => {
		dispatch( recordTracksEvent( 'calypso_a4a_benchmarks_empty_state_view' ) );
	}, [ dispatch ] );

	const handleSubmitClick = () => {
		dispatch( recordTracksEvent( 'calypso_a4a_benchmarks_empty_state_submit_click' ) );
		onSubmitClick();
	};

	const handleLearnMoreClick = () => {
		dispatch( recordTracksEvent( 'calypso_a4a_benchmarks_empty_state_learn_more_click' ) );
		showSupportGuide( BENCHMARKS_KNOWLEDGE_BASE_URL );
	};

	return (
		<div className="benchmarks-empty-state">
			<div>
				<div className="benchmarks-empty-state__heading">
					{ __( 'See how you stack up against agency peers' ) }
				</div>
				<div className="benchmarks-empty-state__description">
					{ __(
						"Submit your quarterly KPIs and get anonymous peer comparisons across margin, retention, AI maturity, and more, so you can see where you're ahead and where to focus."
					) }
				</div>
			</div>
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
			<StepSection heading={ __( 'Learn more about benchmarks' ) }>
				<Button variant="link" onClick={ handleLearnMoreClick }>
					{ __( 'Read the agency benchmarks guide' ) }
				</Button>
			</StepSection>
		</div>
	);
}
