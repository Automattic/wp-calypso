import { SelectControl } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { useState } from 'react';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getAgencySpecializationOptions } from '../../../../constants';
import { getStatCardConfigs } from '../stats-grid/stat-card-config';
import PeerCell from './peer-cell';
import type {
	AgencyBenchmark,
	AggregateMetricKey,
	PeerBenchmarkRow,
	Quarter,
} from '../../../../constants';

import './style.scss';

const PEER_COMPARISON_METRICS: AggregateMetricKey[] = [
	'gross_margin',
	'billable_utilization',
	'avg_project_size_usd',
	'win_rate',
	'retainer_mrr_usd',
	'avg_time_to_close_days',
];

const SPECIALIZATION_LABELS: Record< string, string > = Object.fromEntries(
	getAgencySpecializationOptions().map( ( o ) => [ o.value, o.label ] )
);

// "Peer A — EMEA, 6-15, eCommerce development" — appends whichever bucket fields the peer has.
function describePeer( peer: PeerBenchmarkRow ): string {
	const base = sprintf(
		/* translators: %s: anonymized peer label, e.g. "A". */
		__( 'Peer %s' ),
		peer.label
	);
	const specializations = peer.agency_specializations?.length
		? peer.agency_specializations.map( ( s ) => SPECIALIZATION_LABELS[ s ] ?? s ).join( ', ' )
		: undefined;
	const details = [ peer.agency_region, peer.agency_size, specializations ].filter( Boolean );
	return details.length ? `${ base } — ${ details.join( ', ' ) }` : base;
}

type Props = {
	quarter: Quarter[ 'quarter' ];
	year: Quarter[ 'year' ];
	ownSubmission: AgencyBenchmark;
	peers: PeerBenchmarkRow[];
	sampleSize: number | undefined;
	isLoading: boolean;
};

export default function PeerComparisonCard( {
	quarter,
	year,
	ownSubmission,
	peers,
	sampleSize,
	isLoading,
}: Props ) {
	const dispatch = useDispatch();
	const [ selectedLabel, setSelectedLabel ] = useState< string | null >( null );

	if ( isLoading || peers.length === 0 ) {
		return null;
	}

	const activeLabel =
		selectedLabel && peers.some( ( p ) => p.label === selectedLabel )
			? selectedLabel
			: peers[ 0 ].label;
	const activePeer = peers.find( ( p ) => p.label === activeLabel ) ?? peers[ 0 ];

	const peerOptions = peers.map( ( p ) => ( {
		label: describePeer( p ),
		value: p.label,
	} ) );

	const handlePeerChange = ( value: string ) => {
		setSelectedLabel( value );
		dispatch(
			recordTracksEvent( 'calypso_a4a_benchmarks_peer_selected', {
				quarter,
				year,
				sample_size: sampleSize,
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
