import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import StepSection from 'calypso/a8c-for-agencies/components/step-section';
import useHelpCenter from 'calypso/a8c-for-agencies/hooks/use-help-center';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

// TODO: replace with the published benchmarks Knowledge Base URL once Marketing has one.
const BENCHMARKS_KNOWLEDGE_BASE_URL =
	'https://agencieshelp.automattic.com/knowledge-base/agency-benchmarks/';

type Props = {
	context: 'no_submissions' | 'missing_quarter';
};

export default function LearnMore( { context }: Props ) {
	const dispatch = useDispatch();
	const { showSupportGuide } = useHelpCenter();

	const handleLearnMoreClick = () => {
		dispatch(
			recordTracksEvent( 'calypso_a4a_benchmarks_empty_state_learn_more_click', { context } )
		);
		showSupportGuide( BENCHMARKS_KNOWLEDGE_BASE_URL );
	};

	return (
		<StepSection heading={ __( 'Learn more about benchmarks' ) }>
			<Button variant="link" onClick={ handleLearnMoreClick }>
				{ __( 'Read the agency benchmarks guide' ) }
			</Button>
		</StepSection>
	);
}
