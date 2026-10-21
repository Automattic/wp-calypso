import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import type { InteractiveUiPresentation } from '../../hooks/use-interactive-ui';
import '@automattic/ai-ui-renderer/style.scss';
import './style.scss';

interface Props {
	messageId: string;
	presentation: InteractiveUiPresentation;
}

/** Shows a message's interactive UI surfaces, or a retry when the renderer failed to load. */
export function InteractiveUiSurfaces( { messageId, presentation }: Props ) {
	const { runtime, renderer, revision, isDisabled, hasLoadError, isRetryingLoad, retryLoad } =
		presentation;

	if ( hasLoadError ) {
		return (
			<div role="alert">
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

	// Opts the surfaces out of the chat's typography reset.
	return (
		<div data-agenttic-isolated>
			{ runtime.getSurfaceIds( messageId ).map( ( surfaceId ) => {
				const surface = runtime.getSurface( surfaceId );

				return surface ? (
					<InteractiveUiSurface
						key={ surfaceId }
						surface={ surface }
						disabled={ isDisabled }
						revision={ revision }
					/>
				) : null;
			} ) }
		</div>
	);
}
