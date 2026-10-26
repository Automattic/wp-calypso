import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import type { InteractiveUiPresentation } from '../use-interactive-ui';
import './style.scss';

// Stable, so the components re-render only when their staleness changes.
const STALE_HOST_PROPS = { isMessageStale: true };
const CURRENT_HOST_PROPS = { isMessageStale: false };

interface Props {
	messageId: string;
	presentation: InteractiveUiPresentation;
}

/**
 * Shows a message's interactive UI surfaces, or a retry when the renderer failed to load. A live
 * reply shows one notice: in place of its first surface that can't be shown, or else after its
 * surfaces when the runtime rejected some of its A2UI messages. A stale or busy surface disables
 * its inputs and actions, while its display, tabs and modal triggers stay usable.
 */
export function InteractiveUiSurfaces( { messageId, presentation }: Props ) {
	const {
		runtime,
		renderer,
		revision,
		isBusy,
		staleSurfaceIds,
		rejectedMessageIds,
		restoredMessageIds,
		hasLoadError,
		isRetryingLoad,
		retryLoad,
	} = presentation;

	if ( hasLoadError ) {
		return (
			<div className="agents-manager-interactive-ui-surfaces__load-error" role="alert">
				<p>
					{ isRetryingLoad
						? __( 'Trying again…', __i18n_text_domain__ )
						: __( 'Couldn’t load this. Check your connection.', __i18n_text_domain__ ) }
				</p>
				<Button
					variant="secondary"
					isBusy={ isRetryingLoad }
					disabled={ isRetryingLoad }
					accessibleWhenDisabled
					onClick={ retryLoad }
				>
					{ __( 'Try again', __i18n_text_domain__ ) }
				</Button>
			</div>
		);
	}

	if ( ! runtime || ! renderer ) {
		return null;
	}

	const { InteractiveUiSurface } = renderer;

	const failureNotice = restoredMessageIds.has( messageId ) ? null : (
		<p className="agents-manager-interactive-ui-surfaces__failure" role="status">
			{ __( 'Couldn’t show this. Try asking again.', __i18n_text_domain__ ) }
		</p>
	);

	// Opts the surfaces out of the chat's typography reset.
	return (
		<div className="agents-manager-interactive-ui-surfaces" data-agenttic-isolated>
			{ runtime.getSurfaceIds( messageId ).map( ( surfaceId ) => {
				const surface = runtime.getSurface( surfaceId );
				const isStale = staleSurfaceIds.has( surfaceId );

				return surface ? (
					<InteractiveUiSurface
						key={ surfaceId }
						surface={ surface }
						disabled={ isBusy || isStale }
						className="agents-manager-interactive-ui-surfaces__renderer"
						revision={ revision }
						fallback={ failureNotice }
						hostProps={ isStale ? STALE_HOST_PROPS : CURRENT_HOST_PROPS }
					/>
				) : null;
			} ) }
			{ rejectedMessageIds.has( messageId ) && failureNotice }
		</div>
	);
}
