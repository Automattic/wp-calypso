import { ComponentType } from 'react';

interface TrackComponentViewProps {
	eventName: string;
	eventProperties?: Record< string, unknown >;
	statGroup?: string;
	statName?: string;
	recordTracksEvent?: ( eventName: string, eventProperties?: Record< string, unknown > ) => void;
	bumpStat?: ( statGroup: string, statName: string ) => void;
}

declare const TrackComponentView: ComponentType< TrackComponentViewProps >;

export default TrackComponentView;
