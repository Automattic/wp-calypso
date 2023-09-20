import { ComponentType } from 'react';

declare module 'debug' {
	function factory( namespace: string ): ( message: string ) => void;
	export default factory;
}

declare module 'calypso/state/analytics/actions' {
	export function bumpStat( statGroup: string, statName: string ): void;
	export function recordTracksEvent(
		eventName: string,
		eventProperties?: Record< string, unknown >
	): void;
}

interface TrackComponentViewProps {
	eventName?: string;
	eventProperties?: Record< string, unknown >;
	statGroup?: string;
	statName?: string;
	recordTracksEvent?: ( eventName: string, eventProperties?: Record< string, unknown > ) => void;
	bumpStat?: ( statGroup: string, statName: string ) => void;
}

declare const TrackComponentView: ComponentType< TrackComponentViewProps >;

export default TrackComponentView;
