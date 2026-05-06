import type { FeatureValue } from '../sdk/types';

export type EvalSource = 'override' | 'force' | 'experiment' | 'default' | 'fallback';

export type EvalLogEntry = {
	flag_key: string;
	value: FeatureValue;
	source: EvalSource;
	timestamp: number;
	attributes: Record< string, string >;
};

export interface EvalLog {
	record: ( entry: EvalLogEntry ) => void;
	entries: () => EvalLogEntry[];
	clear: () => void;
}

export function createEvalLog( capacity: number ): EvalLog {
	const buffer: EvalLogEntry[] = [];
	return {
		record: ( entry ) => {
			if ( capacity <= 0 ) {
				return;
			}
			buffer.push( entry );
			if ( buffer.length > capacity ) {
				buffer.splice( 0, buffer.length - capacity );
			}
		},
		entries: () => buffer.slice(),
		clear: () => {
			buffer.length = 0;
		},
	};
}
