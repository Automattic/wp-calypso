import type { TaskUpdate } from '@automattic/agenttic-client';

export function getComponentOpenings( update: TaskUpdate ) {
	if ( update.status.state !== 'input-required' ) {
		return [];
	}
	return ( update.status.message?.parts ?? [] ).flatMap( ( part ) => {
		if (
			part.type !== 'data' ||
			! ( 'toolId' in part.data ) ||
			! ( 'toolCallId' in part.data ) ||
			! [ 'wpcom/render-components', 'wpcom__render_components' ].includes(
				String( part.data.toolId )
			) ||
			typeof part.data.toolCallId !== 'string' ||
			! part.data.toolCallId
		) {
			return [];
		}
		const result = 'arguments' in part.data ? part.data.arguments : undefined;
		return [
			{
				toolCallId: part.data.toolCallId,
				toolId: String( part.data.toolId ),
				result: result ?? ( 'result' in part.data ? part.data.result : undefined ),
			},
		];
	} );
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
