import { Button, Modal } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { closeSmall } from '@wordpress/icons';
import { useEffect, useRef, useState } from 'react';
import SampleAiReportPage from './sample-ai-report-page';
import page01 from './sample-report-pages/page-01.jpg';
import type { AmplifyMode } from '@automattic/api-core';
import type { CSSProperties } from 'react';

const MIN_ZOOM = 0.75;
const MAX_ZOOM = 2.25;
const ZOOM_STEP = 0.25;

export default function AmplifySampleReportModal( {
	mode,
	onClose,
}: {
	mode: AmplifyMode;
	onClose: () => void;
} ) {
	const [ zoom, setZoom ] = useState( 1 );
	const [ isClosing, setIsClosing ] = useState( false );
	const closeTimer = useRef< ReturnType< typeof setTimeout > | null >( null );

	useEffect( () => {
		return () => {
			if ( closeTimer.current ) {
				clearTimeout( closeTimer.current );
			}
		};
	}, [] );

	const closeWithTransition = () => {
		if ( isClosing ) {
			return;
		}
		setIsClosing( true );
		closeTimer.current = setTimeout( onClose, 240 );
	};
	const changeZoom = ( delta: number ) => {
		setZoom( ( current ) => Math.max( MIN_ZOOM, Math.min( MAX_ZOOM, current + delta ) ) );
	};

	return (
		<Modal
			className="dashboard-amplify-sample-preview"
			overlayClassName={ `dashboard-amplify-sample-preview__overlay${
				isClosing ? ' is-closing' : ''
			}` }
			contentLabel={ __( 'Sample report preview' ) }
			size="fill"
			__experimentalHideHeader
			onRequestClose={ closeWithTransition }
		>
			<div className="dashboard-amplify-sample-preview__controls">
				<div className="dashboard-amplify-sample-preview__zoom-controls">
					<Button
						variant="tertiary"
						aria-label={ __( 'Zoom out' ) }
						onClick={ () => changeZoom( -ZOOM_STEP ) }
					>
						−
					</Button>
					<span aria-live="polite">{ Math.round( zoom * 100 ) }%</span>
					<Button
						variant="tertiary"
						aria-label={ __( 'Zoom in' ) }
						onClick={ () => changeZoom( ZOOM_STEP ) }
					>
						+
					</Button>
				</div>
				<Button
					variant="secondary"
					icon={ closeSmall }
					label={ __( 'Close sample report preview' ) }
					onClick={ closeWithTransition }
				/>
			</div>
			<div
				className="dashboard-amplify-sample-preview__viewport"
				role="region"
				aria-label={ __( 'Sample report pages' ) }
				// Scrollable report pages need keyboard focus.
				// eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
				tabIndex={ 0 }
			>
				<div
					className="dashboard-amplify-sample-preview__stage"
					style={ { '--preview-zoom': zoom } as CSSProperties }
				>
					{ mode !== 'ai' && (
						<img
							src={ page01 }
							alt={ __( 'Sample first-time visitor report page' ) }
							width={ 779 }
							height={ 1100 }
						/>
					) }
					{ mode !== 'human' && <SampleAiReportPage /> }
				</div>
			</div>
		</Modal>
	);
}
