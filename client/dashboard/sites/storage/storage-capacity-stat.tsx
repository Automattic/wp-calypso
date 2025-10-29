import { __experimentalHStack as HStack, __experimentalText as Text } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import filesize from 'filesize';
import './storage-capacity-stat.scss';

const MINIMUM_SEGMENT_WIDTH = 0.5; // Minimum width in % to ensure visibility

interface StorageCapacityStatProps {
	/**
	 * Description displayed beside the total capacity (e.g., "6.6 GB used")
	 */
	description: string;

	/**
	 * Current plan storage capacity in bytes
	 */
	currentCapacityBytes: number;

	/**
	 * Add-on storage capacity in bytes
	 */
	addOnCapacityBytes: number;
}

export function StorageCapacityStat( {
	description,
	currentCapacityBytes,
	addOnCapacityBytes,
}: StorageCapacityStatProps ) {
	// Calculate total and percentages
	const totalBytes = currentCapacityBytes + addOnCapacityBytes;
	const totalCapacity = filesize( totalBytes, { round: 0 } );
	const currentCapacityPercent = ( currentCapacityBytes / totalBytes ) * 100;
	const addOnCapacityPercent = ( addOnCapacityBytes / totalBytes ) * 100;

	// Ensure segments are visible even if very small
	const currentWidth = Math.max( currentCapacityPercent, MINIMUM_SEGMENT_WIDTH );
	const addOnWidth = Math.max( addOnCapacityPercent, MINIMUM_SEGMENT_WIDTH );

	return (
		<div className="dashboard-storage-capacity-stat">
			<HStack alignment="baseline" spacing={ 2 } justify="space-between">
				<div className="dashboard-storage-capacity-stat__metric">{ totalCapacity }</div>
				<div className="dashboard-storage-capacity-stat__description">{ description }</div>
			</HStack>
			<div
				className="dashboard-storage-capacity-stat__progress-bar"
				role="progressbar"
				aria-label={ __( 'Storage capacity breakdown' ) }
			>
				<div
					className="dashboard-storage-capacity-stat__progress-segment dashboard-storage-capacity-stat__progress-segment--current"
					style={ { width: `${ currentWidth }%` } }
				/>
				<div
					className="dashboard-storage-capacity-stat__progress-segment dashboard-storage-capacity-stat__progress-segment--addon"
					style={ { width: `${ addOnWidth }%` } }
				/>
			</div>
			<HStack spacing={ 2 } alignment="left">
				<Text
					variant="muted"
					size={ 12 }
					className="dashboard-storage-capacity-stat__legend-item dashboard-storage-capacity-stat__legend-item--current"
				>
					{ sprintf(
						// translators: %s is the plan storage amount
						__( '%s plan storage' ),
						filesize( currentCapacityBytes, { round: 0 } )
					) }
				</Text>
				<Text
					variant="muted"
					size={ 12 }
					className="dashboard-storage-capacity-stat__legend-item dashboard-storage-capacity-stat__legend-item--addon"
				>
					{ sprintf(
						// translators: %s is the storage add-on amount
						__( '%s storage add-on' ),
						filesize( addOnCapacityBytes, { round: 0 } )
					) }
				</Text>
			</HStack>
		</div>
	);
}
