import { SelectControl } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { useState } from 'react';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import useFetchBenchmarkPeers from '../../../hooks/use-fetch-benchmark-peers';
import { getStatCardConfigs } from '../stats-grid/stat-card-config';
import PeerCell from './peer-cell';
import type { AgencyBenchmark, AggregateMetricKey, Quarter } from '../../../constants';

import './style.scss';

const PEER_COMPARISON_METRICS: AggregateMetricKey[] = [
	'gross_margin',
	'billable_utilization',
	'avg_project_size_usd',
	'win_rate',
	'retainer_mrr_usd',
	'avg_time_to_close_days',
];

type Props = {
	quarter: Quarter[ 'quarter' ];
	year: Quarter[ 'year' ];
	ownSubmission: AgencyBenchmark;
};

export default function PeerComparisonCard( { quarter, year, ownSubmission }: Props ) {
	const dispatch = useDispatch();
	const { data: peerData, isLoading } = useFetchBenchmarkPeers( quarter, year );
	const [ selectedLabel, setSelectedLabel ] = useState< string | null >( null );

	if ( isLoading || ! peerData || peerData.peers.length === 0 ) {
		return null;
	}

	const activeLabel =
		selectedLabel && peerData.peers.some( ( p ) => p.label === selectedLabel )
			? selectedLabel
			: peerData.peers[ 0 ].label;
	const activePeer = peerData.peers.find( ( p ) => p.label === activeLabel ) ?? peerData.peers[ 0 ];

	const peerOptions = peerData.peers.map( ( p ) => ( {
		label: sprintf(
			/* translators: %s: anonymized peer label, e.g. "A". */
			__( 'Peer %s' ),
			p.label
		),
		value: p.label,
	} ) );

	const handlePeerChange = ( value: string ) => {
		setSelectedLabel( value );
		dispatch(
			recordTracksEvent( 'calypso_a4a_benchmarks_peer_selected', {
				quarter,
				year,
				sample_size: peerData.sample_size,
			} )
		);
	};

	const configs = getStatCardConfigs().filter( ( c ) =>
		PEER_COMPARISON_METRICS.includes( c.metricKey )
	);

	return (
		<section className="benchmarks-peer-comparison">
			<header className="benchmarks-peer-comparison-header">
				<div className="benchmarks-peer-comparison-heading">
					<h3>{ __( 'Compare to a specific peer' ) }</h3>
					<p>{ __( 'Anonymized peer in your segment. Names never reveal real identities.' ) }</p>
				</div>
				<SelectControl
					value={ activeLabel }
					options={ peerOptions }
					onChange={ handlePeerChange }
					label={ __( 'Select a peer' ) }
					hideLabelFromVision
					__nextHasNoMarginBottom
				/>
			</header>
			<div className="benchmarks-peer-comparison-grid">
				{ configs.map( ( config ) => {
					const youValue = config.getSubmissionValue( ownSubmission );
					const peerValue = activePeer.metrics[ config.metricKey ];
					if ( youValue === undefined || peerValue === undefined ) {
						return null;
					}
					return (
						<PeerCell
							key={ config.metricKey }
							config={ config }
							peerLabel={ activeLabel }
							youValue={ youValue }
							peerValue={ peerValue }
						/>
					);
				} ) }
			</div>
		</section>
	);
}
