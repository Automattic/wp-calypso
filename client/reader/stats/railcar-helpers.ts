import { recordTrack } from './record-track';
import type { ReaderEventProperties, ReaderRailcar } from './types';

type PermittedRailcarProp = 'ui_algo' | 'ui_position';

type PermittedRailcarProps = Partial< Record< PermittedRailcarProp, string | number > >;

export function getPermittedRailcarProps(
	eventProps: ReaderEventProperties
): PermittedRailcarProps {
	const permittedRailcarProps: PermittedRailcarProps = {};
	const { ui_algo, ui_position } = eventProps;
	if ( ( ui_algo && typeof ui_algo === 'string' ) || typeof ui_algo === 'number' ) {
		permittedRailcarProps.ui_algo = ui_algo;
	}
	if ( ( ui_position && typeof ui_position === 'string' ) || typeof ui_position === 'number' ) {
		permittedRailcarProps.ui_position = ui_position;
	}
	return permittedRailcarProps;
}

export function recordTracksRailcar(
	action: string,
	eventName: string,
	railcar: ReaderRailcar,
	overrides: object = {}
): void {
	// Flatten the railcar down into the event props
	recordTrack(
		action,
		Object.assign(
			eventName ? { action: eventName.replace( 'calypso_reader_', '' ) } : {},
			railcar,
			overrides
		)
	);
}

export function recordTracksRailcarRender(
	eventName: string,
	railcar: ReaderRailcar,
	overrides: object = {}
): void {
	return recordTracksRailcar( 'calypso_traintracks_render', eventName, railcar, overrides );
}

export function recordTracksRailcarInteract(
	eventName: string,
	railcar: ReaderRailcar,
	overrides: object = {}
): void {
	return recordTracksRailcar( 'calypso_traintracks_interact', eventName, railcar, overrides );
}

export function recordRailcar(
	eventName: string,
	railcar: ReaderRailcar,
	eventProperties: ReaderEventProperties
): void {
	recordTracksRailcarInteract( eventName, railcar, getPermittedRailcarProps( eventProperties ) );
}

export function recordTrackWithRailcar(
	eventName: string,
	railcar: ReaderRailcar,
	eventProperties: ReaderEventProperties
): void {
	recordTrack( eventName, eventProperties );
	recordRailcar( eventName, railcar, eventProperties );
}
