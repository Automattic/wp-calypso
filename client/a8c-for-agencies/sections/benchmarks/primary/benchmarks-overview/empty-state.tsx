import { useEffect } from 'react';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import Hero from './shared/hero';
import HowToStart from './shared/how-to-start';
import LearnMore from './shared/learn-more';
import WhatYouGet from './shared/what-you-get';

type Props = {
	onSubmitClick: () => void;
};

export default function BenchmarksEmptyState( { onSubmitClick }: Props ) {
	const dispatch = useDispatch();

	useEffect( () => {
		dispatch(
			recordTracksEvent( 'calypso_a4a_benchmarks_empty_state_view', { context: 'no_submissions' } )
		);
	}, [ dispatch ] );

	return (
		<div className="benchmarks-empty-state">
			<Hero />
			<WhatYouGet />
			<HowToStart onSubmitClick={ onSubmitClick } />
			<LearnMore context="no_submissions" />
		</div>
	);
}
