import { Notice, Spinner } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import type { A2uiRuntime, A2uiSurface } from '../../a2ui';
import './style.scss';

export interface A2uiPresentation {
	runtime?: A2uiRuntime;
	Surface?: typeof A2uiSurface;
	error?: string;
	errorSurfaceId?: string;
	isExecuting?: boolean;
}

export default function A2uiChatSurface( {
	surfaceId,
	runtime,
	Surface,
	error,
	errorSurfaceId,
	isExecuting,
	isProcessing,
}: A2uiPresentation & { surfaceId: string; isProcessing?: boolean } ) {
	return (
		<>
			{ error && ( ! errorSurfaceId || errorSurfaceId === surfaceId ) && (
				<Notice status="error" isDismissible={ false } className="agents-manager-a2ui-error">
					{ error }
				</Notice>
			) }
			{ runtime && Surface ? (
				<fieldset
					className="agents-manager-a2ui-surface"
					disabled={ isProcessing || isExecuting }
					style={ { border: 0, padding: 0, margin: 0, minWidth: 0 } }
				>
					<Surface runtime={ runtime } surfaceId={ surfaceId } />
				</fieldset>
			) : (
				! error && <Spinner aria-label={ __( 'Loading form', __i18n_text_domain__ ) } />
			) }
		</>
	);
}
