import type { Output } from '../types';

const outputsCache = new Map< string, Output >();

export function getOutput( id: string ): Output | undefined {
	return outputsCache.get( id );
}

export function saveOutput( output: Output ): void {
	outputsCache.set( output.id, output );
}
