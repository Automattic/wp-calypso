import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useCallback } from 'react';
import useHelpCenter from 'calypso/a8c-for-agencies/hooks/use-help-center';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

// TODO: replace with the published "About this data" Knowledge Base URL once Marketing has one.
const ABOUT_THIS_DATA_URL =
	'https://agencieshelp.automattic.com/knowledge-base/agency-benchmarks-data/';

export default function HowToReadCard() {
	const dispatch = useDispatch();
	const { showSupportGuide } = useHelpCenter();

	const handleAboutClick = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_a4a_benchmarks_about_data_click' ) );
		showSupportGuide( ABOUT_THIS_DATA_URL );
	}, [ dispatch, showSupportGuide ] );

	return (
		<section className="benchmarks-how-to-read">
			<h2 className="benchmarks-how-to-read__eyebrow">{ __( 'How to read this report' ) }</h2>
			<p>
				{ __(
					'Peer comparisons appear when at least 10 agencies in your segment have submitted.'
				) }
			</p>
			<p>
				{ __(
					'Each metric is shown against two peer groups: agencies using Automattic for Agencies and agencies not using it. The data is gathered organically from product usage, submissions, and ecosystem signal, not from formal research.'
				) }
			</p>
			<p>
				{ __( 'Use it for direction. Treat single-quarter swings with a grain of salt.' ) }{ ' ' }
				<Button variant="link" onClick={ handleAboutClick }>
					{ __( 'About this data' ) }
				</Button>
			</p>
		</section>
	);
}
