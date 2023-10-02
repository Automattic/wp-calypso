import { gaRecordEvent } from 'calypso/lib/analytics/ga';
import debug from './debug';

export function recordGaEvent( action: string, label: string, value?: string ) {
	debug( 'reader ga event', action, label, value );
	gaRecordEvent( 'Reader', action, label, value );
}
