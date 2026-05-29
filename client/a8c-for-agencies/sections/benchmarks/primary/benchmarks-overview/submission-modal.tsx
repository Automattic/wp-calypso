import { Modal } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { useEffect } from 'react';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import BenchmarksForm from './benchmarks-form';

type Props = {
	quarter: 1 | 2 | 3 | 4;
	year: number;
	onClose: () => void;
};

export default function SubmissionModal( { quarter, year, onClose }: Props ) {
	const dispatch = useDispatch();

	useEffect( () => {
		dispatch( recordTracksEvent( 'calypso_a4a_benchmarks_modal_open', { quarter, year } ) );
	}, [ dispatch, quarter, year ] );

	const handleRequestClose = () => {
		dispatch( recordTracksEvent( 'calypso_a4a_benchmarks_modal_close', { quarter, year } ) );
		onClose();
	};

	const title = sprintf(
		/* translators: %1$d: quarter number, %2$d: year. Example: Submit Q1 2026 benchmarks. */
		__( 'Submit Q%1$d %2$d benchmarks' ),
		quarter,
		year
	);

	return (
		<Modal
			title={ title }
			onRequestClose={ handleRequestClose }
			className="benchmarks-submission-modal"
			size="medium"
		>
			<BenchmarksForm quarter={ quarter } year={ year } hideHeader onSubmitSuccess={ onClose } />
		</Modal>
	);
}
