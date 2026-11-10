import { recordAgentsManagerTracksEvent } from '../utils/tracks';
import type { InteractiveUiSession } from './session';
import type {
	InteractiveUiAction,
	InteractiveUiError,
	InteractiveUiRuntime,
} from '@automattic/ai-ui-renderer';

type InteractiveUiSurfaceModel = NonNullable< ReturnType< InteractiveUiRuntime[ 'getSurface' ] > >;

/**
 * The Tracks props that name a surface and, if given, one of its components: the surface's ID, its
 * default catalog, which tells an ability's surfaces from the agent's, and the component's type.
 */
function getInteractiveUiSurfaceTracksProps(
	surface: InteractiveUiSurfaceModel,
	componentId?: string
) {
	const catalogId = surface.defaultCatalog?.id;
	const componentType = componentId && surface.componentsModel.get( componentId )?.type;

	return {
		surface_id: surface.id,
		...( catalogId && { catalog_id: catalogId } ),
		...( componentType && { component_type: componentType } ),
	};
}

/**
 * Records each surface a live reply shows, by its root component, once that has arrived, even if
 * it then fails to render. A surface restored from history isn't recorded, and a surface is
 * recorded once a session, however often a rebuild applies it again.
 */
export function recordRenderedInteractiveUiSurfaces( session: InteractiveUiSession ) {
	const { runtime, appliedBatches, history, renderedSurfaceIds } = session;

	if ( ! runtime ) {
		return;
	}

	for ( const batch of appliedBatches ) {
		if ( history.restoredMessageIds.has( batch.messageId ) ) {
			continue;
		}

		for ( const surfaceId of runtime.getSurfaceIds( batch.messageId ) ) {
			const surface = runtime.getSurface( surfaceId );

			if (
				! surface?.componentsModel.has( surface.rootId ) ||
				renderedSurfaceIds.has( surfaceId )
			) {
				continue;
			}

			renderedSurfaceIds.add( surfaceId );

			recordAgentsManagerTracksEvent(
				'calypso_agents_manager_interactive_ui_rendered',
				getInteractiveUiSurfaceTracksProps( surface, surface.rootId )
			);
		}
	}
}

/**
 * Records an action a surface sends the agent, by its surface and the component that sent it. Its
 * name and context can carry the user's input, so they aren't recorded.
 */
export function recordInteractiveUiAction(
	action: InteractiveUiAction,
	session: InteractiveUiSession
) {
	const surface = session.runtime?.getSurface( action.surfaceId );

	recordAgentsManagerTracksEvent(
		'calypso_agents_manager_interactive_ui_action',
		surface ? getInteractiveUiSurfaceTracksProps( surface, action.sourceComponentId ) : {}
	);
}

/**
 * Logs an interactive UI error and records it in Tracks by its code and, when the runtime has its
 * surface, the surface's ID and catalog. Its message can quote the agent's content, so it isn't
 * recorded. Each error is reported once a message, however often a rebuild or retry reports it
 * again. A restored message's error is only logged: it was recorded live, or its cause isn't the
 * reply, such as a host without its catalog.
 */
export function reportInteractiveUiError(
	error: InteractiveUiError,
	ownerId: string,
	session: InteractiveUiSession
) {
	const errorKey = `${ ownerId }:${ error.surfaceId ?? '' }:${ error.code }:${ error.message }`;

	if ( session.reportedErrorKeys.has( errorKey ) ) {
		return;
	}

	session.reportedErrorKeys.add( errorKey );

	// eslint-disable-next-line no-console
	console.error( '[AgentsManager] Interactive UI error:', error );

	if ( session.history.restoredMessageIds.has( ownerId ) ) {
		return;
	}

	const surface = error.surfaceId ? session.runtime?.getSurface( error.surfaceId ) : undefined;

	recordAgentsManagerTracksEvent( 'calypso_agents_manager_interactive_ui_error', {
		error_code: error.code,
		...( surface && getInteractiveUiSurfaceTracksProps( surface ) ),
	} );
}
