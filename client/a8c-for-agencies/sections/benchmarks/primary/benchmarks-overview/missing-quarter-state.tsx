import { useEffect } from 'react';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import Hero from './shared/hero';
import LearnMore from './shared/learn-more';
import WhatYouGet from './shared/what-you-get';

export default function BenchmarksMissingQuarterState() {
	const dispatch = useDispatch();

	useEffect( () => {
		dispatch(
			recordTracksEvent( 'calypso_a4a_benchmarks_empty_state_view', { context: 'missing_quarter' } )
		);
	}, [ dispatch ] );

	return (
		<div className="benchmarks-empty-state">
			<Hero />
			<WhatYouGet />
			<LearnMore context="missing_quarter" />
		</div>
	);
}
