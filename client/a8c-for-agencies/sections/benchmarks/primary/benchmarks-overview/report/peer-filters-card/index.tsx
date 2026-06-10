import { SelectControl } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import {
	getAgencyRegionOptions,
	getAgencySizeOptions,
	getAgencySpecializationOptions,
} from '../../../../constants';
import { BUCKET_ALL } from '../../../../lib/filter-peers';
import type { AgencyBenchmark } from '../../../../constants';
import type { PeerFilters } from '../../../../lib/filter-peers';

import './style.scss';

type Props = {
	ownSubmission: AgencyBenchmark;
	filters: PeerFilters;
	onChange: ( filters: PeerFilters ) => void;
	filteredPeerCount: number;
	peersAvailable: boolean;
};

type Dimension = keyof PeerFilters;

function withAllOption( options: { value: string; label: string }[] ) {
	return [ { value: BUCKET_ALL, label: __( 'All' ) }, ...options ];
}

function labelForBucket(
	value: string | null | undefined,
	options: { value: string; label: string }[]
) {
	if ( value == null ) {
		return __( 'Unknown' );
	}
	return options.find( ( o ) => o.value === value )?.label ?? value;
}

export default function PeerFiltersCard( {
	ownSubmission,
	filters,
	onChange,
	filteredPeerCount,
	peersAvailable,
}: Props ) {
	const dispatch = useDispatch();

	const sizeOptions = getAgencySizeOptions();
	const regionOptions = getAgencyRegionOptions();
	const specializationOptions = getAgencySpecializationOptions();

	const handleChange = ( dimension: Dimension ) => ( value: string ) => {
		onChange( { ...filters, [ dimension ]: value } as PeerFilters );
		dispatch(
			recordTracksEvent( 'calypso_a4a_benchmarks_peer_filter_changed', { dimension, value } )
		);
	};

	const ownSpecializations = ownSubmission.agency_specializations?.length
		? ownSubmission.agency_specializations
				.map( ( s ) => labelForBucket( s, specializationOptions ) )
				.join( ', ' )
		: __( 'Unknown' );

	return (
		<section className="benchmarks-peer-filters">
			<h2 className="benchmarks-peer-filters__eyebrow">
				{ __( 'Compare against peer agencies' ) }
			</h2>
			<p className="benchmarks-peer-filters-own">
				{ createInterpolateElement(
					__(
						// translators: <size />, <region />, <spec /> are bolded values like "6–10", "North America", "eCommerce development".
						'These filters compare you against agencies similar in size, region, and specialty. Yours is a <size /> agency in <region />, specializing in <spec />.'
					),
					{
						size: <strong>{ labelForBucket( ownSubmission.agency_size, sizeOptions ) }</strong>,
						region: (
							<strong>{ labelForBucket( ownSubmission.agency_region, regionOptions ) }</strong>
						),
						spec: <strong>{ ownSpecializations }</strong>,
					}
				) }
			</p>
			<div className="benchmarks-peer-filters-controls">
				<SelectControl
					label={ __( 'Size' ) }
					labelPosition="side"
					value={ filters.size }
					options={ withAllOption( sizeOptions ) }
					onChange={ handleChange( 'size' ) }
					__nextHasNoMarginBottom
				/>
				<SelectControl
					label={ __( 'Region' ) }
					labelPosition="side"
					value={ filters.region }
					options={ withAllOption( regionOptions ) }
					onChange={ handleChange( 'region' ) }
					__nextHasNoMarginBottom
				/>
				<SelectControl
					label={ __( 'Specialization' ) }
					labelPosition="side"
					value={ filters.specialization }
					options={ withAllOption( specializationOptions ) }
					onChange={ handleChange( 'specialization' ) }
					__nextHasNoMarginBottom
				/>
			</div>
			{ peersAvailable && filteredPeerCount === 0 && (
				<p className="benchmarks-peer-filters-empty">
					{ __( 'No peers match these filters. Try widening your selection.' ) }
				</p>
			) }
		</section>
	);
}
