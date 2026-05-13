import { __, sprintf } from '@wordpress/i18n';
import { getLocaleSlug } from 'i18n-calypso';
import { useEffect } from 'react';
import StepSectionItem from 'calypso/a8c-for-agencies/components/step-section-item';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import getSubmissionDeadline from '../../lib/get-submission-deadline';

type Props = {
	quarter: 1 | 2 | 3 | 4;
	year: number;
	onSubmitClick: () => void;
};

export default function SubmissionBanner( { quarter, year, onSubmitClick }: Props ) {
	const dispatch = useDispatch();

	useEffect( () => {
		dispatch( recordTracksEvent( 'calypso_a4a_benchmarks_banner_view', { quarter, year } ) );
	}, [ dispatch, quarter, year ] );

	const deadline = getSubmissionDeadline( { quarter, year } );
	const formattedDeadline = new Intl.DateTimeFormat( getLocaleSlug() ?? undefined, {
		month: 'long',
		day: 'numeric',
		timeZone: 'UTC',
	} ).format( deadline );

	const heading = sprintf(
		/* translators: %1$d: quarter number, %2$d: year. Example: Q1 2026 benchmark submission is due. */
		__( 'Q%1$d %2$d benchmark submission is due' ),
		quarter,
		year
	);

	const description = sprintf(
		/* translators: %s: deadline date, e.g. April 30. */
		__( 'Submit by %s to keep your comparison data current.' ),
		formattedDeadline
	);

	const handleSubmitClick = () => {
		dispatch(
			recordTracksEvent( 'calypso_a4a_benchmarks_banner_submit_click', { quarter, year } )
		);
		onSubmitClick();
	};

	return (
		<StepSectionItem
			className="benchmarks-submission-prompt"
			heading={ heading }
			description={ description }
			buttonProps={ {
				primary: true,
				onClick: handleSubmitClick,
				children: __( 'Submit benchmark' ),
			} }
		/>
	);
}
