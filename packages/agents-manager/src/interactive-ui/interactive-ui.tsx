import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import type { InteractiveUiPresentation } from '../hooks/use-interactive-ui';
import './style.scss';

export default function InteractiveUi( {
	messageId,
	presentation,
}: {
	messageId: string;
	presentation: InteractiveUiPresentation;
} ) {
	const { runtime, sdk, revision, isDisabled, hasLoadError, retryLoad } = presentation;
	if ( hasLoadError ) {
		return (
			<div role="alert">
				<p>{ __( 'This form could not be loaded.', __i18n_text_domain__ ) }</p>
				<Button variant="secondary" onClick={ retryLoad }>
					{ __( 'Try again', __i18n_text_domain__ ) }
				</Button>
			</div>
		);
	}
	if ( ! runtime || ! sdk ) {
		return null;
	}
	const { InteractiveUiSurface: Surface } = sdk;
	return runtime.getSurfaceIds( messageId ).map( ( surfaceId ) => {
		const surface = runtime.getSurface( surfaceId );
		return surface ? (
			<Surface
				key={ surfaceId }
				surface={ surface }
				revision={ revision }
				isDisabled={ isDisabled }
			/>
		) : null;
	} );
}
