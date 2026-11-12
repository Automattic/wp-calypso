import { Component, lazy, Suspense } from '@wordpress/element';
import LoadingSpinner from '../loading-spinner';
import type { CropOverlayProps } from './index';

const RETRY_DELAY_MS = 500;

const loadCropOverlay = () =>
	import( /* webpackChunkName: "crop-overlay" */ './index' ).then( ( module ) => ( {
		default: module.CropOverlay,
	} ) );

// `lazy()` caches a rejected import, so retry once after a pause, and start over after a failure.
const createLazyCropOverlay = () =>
	lazy( () =>
		loadCropOverlay().catch( () =>
			new Promise( ( resolve ) => setTimeout( resolve, RETRY_DELAY_MS ) ).then( loadCropOverlay )
		)
	);

let LazyCropOverlayInner = createLazyCropOverlay();

class CropOverlayBoundary extends Component<
	{ children: React.ReactNode; onError: () => void },
	{ failed: boolean }
> {
	state = { failed: false };

	static getDerivedStateFromError() {
		return { failed: true };
	}

	componentDidCatch( error: Error ) {
		window.console?.error?.( error );
		LazyCropOverlayInner = createLazyCropOverlay();
		this.props.onError();
	}

	render() {
		return this.state.failed ? null : this.props.children;
	}
}

export function LazyCropOverlay( {
	onLoadError,
	...props
}: CropOverlayProps & { onLoadError: () => void } ) {
	return (
		<CropOverlayBoundary onError={ onLoadError }>
			<Suspense fallback={ <LoadingSpinner /> }>
				<LazyCropOverlayInner { ...props } />
			</Suspense>
		</CropOverlayBoundary>
	);
}
