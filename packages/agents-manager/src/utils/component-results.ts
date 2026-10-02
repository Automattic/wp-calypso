import { normalizeComponentResultPart } from '@automattic/agenttic-client';
import type { ComponentSessionOptions } from '@automattic/agent-components';
import type { TaskUpdate } from '@automattic/agenttic-client';

export function getComponentOpeningSignature( value: unknown ): string {
	return (
		JSON.stringify( value, ( _key, item: unknown ) =>
			item && typeof item === 'object' && ! Array.isArray( item )
				? Object.fromEntries(
						Object.entries( item ).sort( ( [ left ], [ right ] ) => {
							if ( left === right ) {
								return 0;
							}
							return left < right ? -1 : 1;
						} )
					)
				: item
		) ?? ''
	);
}

export function getValidatedComponentOpening(
	value: unknown,
	validation: Pick<
		typeof import( '@automattic/agent-components/validation' ),
		'validateComponentOpening' | 'validateLegacyButtonAction'
	>,
	legacyOnly = false
): Pick<
	ComponentSessionOptions,
	'result' | 'allowedActions' | 'actionBindings' | 'expiresAt'
> | null {
	const opening = legacyOnly ? null : validation.validateComponentOpening( value );
	if ( opening ) {
		if ( Date.parse( opening.expiresAt ) <= Date.now() ) {
			return null;
		}
		return {
			result: opening.result,
			allowedActions: opening.allowedActions,
			actionBindings: opening.actionBindings,
			expiresAt: opening.expiresAt,
		};
	}
	const result = validation.validateLegacyButtonAction( value );
	return result?.status === 'awaiting-input' && result.revision === 1 ? { result } : null;
}

export function getComponentOpenings( update: TaskUpdate ) {
	if ( ! [ 'input-required', 'completed' ].includes( update.status.state ) ) {
		return [];
	}
	const parts = update.status.message?.parts ?? [];
	const toolIds = new Map< string, string | null >();
	for ( const part of parts ) {
		if (
			part.type === 'data' &&
			'toolCallId' in part.data &&
			'toolId' in part.data &&
			typeof part.data.toolCallId === 'string' &&
			typeof part.data.toolId === 'string' &&
			part.data.toolId
		) {
			const previous = toolIds.get( part.data.toolCallId );
			toolIds.set(
				part.data.toolCallId,
				previous === undefined || previous === part.data.toolId ? part.data.toolId : null
			);
		}
	}
	const liveCalls = new Set(
		parts.flatMap( ( part ) => {
			const live = normalizeComponentResultPart( part );
			return live ? [ live.toolCallId ] : [];
		} )
	);
	const openings = parts.flatMap( ( part ) => {
		const live = normalizeComponentResultPart( part );
		if ( live ) {
			return [
				{
					toolCallId: live.toolCallId,
					toolId: toolIds.get( live.toolCallId ) ?? '',
					result: live.result,
					legacyOnly: false,
				},
			];
		}
		if (
			update.status.state !== 'input-required' ||
			part.type !== 'data' ||
			! ( 'toolId' in part.data ) ||
			! ( 'toolCallId' in part.data ) ||
			! [ 'wpcom/render-components', 'wpcom__render_components' ].includes(
				String( part.data.toolId )
			) ||
			typeof part.data.toolCallId !== 'string' ||
			! part.data.toolCallId ||
			liveCalls.has( part.data.toolCallId )
		) {
			return [];
		}
		const result = 'result' in part.data ? part.data.result : undefined;
		return [
			{
				toolCallId: part.data.toolCallId,
				toolId: String( part.data.toolId ),
				result: result ?? ( 'arguments' in part.data ? part.data.arguments : undefined ),
				legacyOnly: result === undefined || result === null,
			},
		];
	} );
	const unique = new Map< string, ( typeof openings )[ number ] >();
	for ( const opening of openings ) {
		const previous = unique.get( opening.toolCallId );
		if ( ! previous ) {
			unique.set( opening.toolCallId, opening );
			continue;
		}
		try {
			if (
				previous.toolId === opening.toolId &&
				previous.legacyOnly === opening.legacyOnly &&
				getComponentOpeningSignature( previous.result ) ===
					getComponentOpeningSignature( opening.result )
			) {
				continue;
			}
		} catch {
			unique.set( opening.toolCallId, { ...previous, result: undefined } );
			continue;
		}
		unique.set( opening.toolCallId, { ...previous, result: undefined } );
	}
	return [ ...unique.values() ];
}

export function mergeComponentMessages< T extends { timestamp?: number } >(
	messages: T[],
	components: T[]
): T[] {
	const merged = [ ...messages ];
	for ( const component of components ) {
		let after = -1;
		merged.forEach( ( message, index ) => {
			if ( ( message.timestamp ?? 0 ) <= ( component.timestamp ?? 0 ) ) {
				after = index;
			}
		} );
		merged.splice( after + 1, 0, component );
	}
	return merged;
}
