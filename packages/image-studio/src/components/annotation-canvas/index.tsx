import { useDispatch } from '@wordpress/data';
import { useCallback, useEffect, useRef, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { store as imageStudioStore } from '../../store';
import type { ImageStudioActions } from '../../store';
import type { AnnotationPath, AnnotationPoint } from '../../types/annotation';
import './style.scss';

interface AnnotationCanvasProps {
	imageUrl: string | null;
	imageElement: HTMLImageElement | null;
}

/**
 * Renders annotation paths onto a canvas context.
 * @param context  - Canvas 2D context
 * @param pathList - List of annotation paths
 */
function renderPathsOnContext( context: CanvasRenderingContext2D, pathList: AnnotationPath[] ) {
	pathList.forEach( ( path ) => {
		context.save();
		context.lineJoin = 'round';
		context.lineCap = 'round';
		context.lineWidth = path.width || 5;
		context.globalCompositeOperation = 'source-over';
		context.strokeStyle = '#2271b1'; // WordPress primary blue

		context.beginPath();
		path.points.forEach( ( point, index ) => {
			if ( index === 0 ) {
				context.moveTo( point.x, point.y );
			} else {
				context.lineTo( point.x, point.y );
			}
		} );
		context.stroke();
		context.restore();
	} );
}

export default function AnnotationCanvas( { imageUrl, imageElement }: AnnotationCanvasProps ) {
	// Canvas refs - only need committed and live (base is the actual image in DOM)
	const committedCanvasRef = useRef< HTMLCanvasElement >( null );
	const liveCanvasRef = useRef< HTMLCanvasElement >( null );
	const [ isDrawing, setIsDrawing ] = useState( false );
	const [ currentPath, setCurrentPath ] = useState< AnnotationPath | null >( null );
	const [ committedPaths, setCommittedPaths ] = useState< AnnotationPath[] >( [] );
	const [ undonePaths, setUndonePaths ] = useState< AnnotationPath[] >( [] );
	const [ displayDimensions, setDisplayDimensions ] = useState( {
		width: 0,
		height: 0,
	} );
	const [ originalDimensions, setOriginalDimensions ] = useState( {
		width: 0,
		height: 0,
	} );

	// Fixed settings - always pen mode with thicker stroke width
	const currentTool = 'pen';
	const strokeWidth = 5;

	// Initialize canvases and set up resize observer
	useEffect( () => {
		if ( ! imageElement || ! committedCanvasRef.current || ! liveCanvasRef.current ) {
			return;
		}

		const committedCanvas = committedCanvasRef.current;
		const liveCanvas = liveCanvasRef.current;

		const updateCanvasSize = () => {
			const displayWidth = imageElement.clientWidth;
			const displayHeight = imageElement.clientHeight;
			const naturalWidth = imageElement.naturalWidth;
			const naturalHeight = imageElement.naturalHeight;

			const targetWidth = naturalWidth || displayWidth;
			const targetHeight = naturalHeight || displayHeight;

			if ( committedCanvas.width !== targetWidth || committedCanvas.height !== targetHeight ) {
				committedCanvas.width = targetWidth;
				committedCanvas.height = targetHeight;
				liveCanvas.width = targetWidth;
				liveCanvas.height = targetHeight;
			}

			setDisplayDimensions( {
				width: displayWidth,
				height: displayHeight,
			} );

			setOriginalDimensions( {
				width: naturalWidth,
				height: naturalHeight,
			} );

			// Update CSS size to match displayed image size
			committedCanvas.style.width = `${ displayWidth }px`;
			committedCanvas.style.height = `${ displayHeight }px`;
			liveCanvas.style.width = `${ displayWidth }px`;
			liveCanvas.style.height = `${ displayHeight }px`;

			// Position canvases to exactly overlay the image
			// Get the image's position relative to the overlay container
			const imageRect = imageElement.getBoundingClientRect();
			const overlayContainer = committedCanvas.parentElement;

			if ( overlayContainer ) {
				const containerRect = overlayContainer.getBoundingClientRect();
				const left = imageRect.left - containerRect.left;
				const top = imageRect.top - containerRect.top;

				committedCanvas.style.left = `${ left }px`;
				committedCanvas.style.top = `${ top }px`;
				liveCanvas.style.left = `${ left }px`;
				liveCanvas.style.top = `${ top }px`;
			}
		};

		updateCanvasSize();

		// Set up ResizeObserver to handle window/image resizing
		const resizeObserver = new ResizeObserver( updateCanvasSize );
		resizeObserver.observe( imageElement );

		return () => {
			resizeObserver.disconnect();
		};
	}, [ imageElement ] );

	// Get pointer position relative to canvas
	const getScaleFactors = useCallback( () => {
		const scaleX = displayDimensions.width
			? ( originalDimensions.width || displayDimensions.width ) / displayDimensions.width
			: 1;
		const scaleY = displayDimensions.height
			? ( originalDimensions.height || displayDimensions.height ) / displayDimensions.height
			: 1;
		return {
			scaleX: Number.isFinite( scaleX ) ? scaleX : 1,
			scaleY: Number.isFinite( scaleY ) ? scaleY : 1,
			avgScale: Number.isFinite( scaleX + scaleY )
				? ( ( Number.isFinite( scaleX ) ? scaleX : 1 ) +
						( Number.isFinite( scaleY ) ? scaleY : 1 ) ) /
				  2
				: 1,
		};
	}, [ displayDimensions, originalDimensions ] );

	const getPointerPosition = useCallback(
		( e: React.PointerEvent< HTMLCanvasElement > ): AnnotationPoint => {
			const canvas = liveCanvasRef.current;
			if ( ! canvas ) {
				return { x: 0, y: 0 };
			}

			const rect = canvas.getBoundingClientRect();
			const { scaleX, scaleY } = getScaleFactors();
			return {
				x: ( e.clientX - rect.left ) * scaleX,
				y: ( e.clientY - rect.top ) * scaleY,
			};
		},
		[ getScaleFactors ]
	);

	// Pointer event handlers
	const handlePointerDown = useCallback(
		( e: React.PointerEvent< HTMLCanvasElement > ) => {
			e.preventDefault();
			const point = getPointerPosition( e );

			const newPath: AnnotationPath = {
				mode: currentTool,
				width: strokeWidth,
				points: [ point ],
			};

			setCurrentPath( newPath );
			setIsDrawing( true );

			// Capture pointer
			liveCanvasRef.current?.setPointerCapture( e.pointerId );
		},
		[ currentTool, strokeWidth, getPointerPosition ]
	);

	const handlePointerMove = useCallback(
		( e: React.PointerEvent< HTMLCanvasElement > ) => {
			if ( ! isDrawing || ! currentPath ) {
				return;
			}

			e.preventDefault();
			const point = getPointerPosition( e );

			// Add point to current path
			const updatedPath = {
				...currentPath,
				points: [ ...currentPath.points, point ],
			};
			setCurrentPath( updatedPath );

			// Redraw live canvas
			const liveCanvas = liveCanvasRef.current;
			const committedCanvas = committedCanvasRef.current;
			if ( ! liveCanvas || ! committedCanvas ) {
				return;
			}

			const ctx = liveCanvas.getContext( '2d' );
			if ( ! ctx ) {
				return;
			}

			// Clear and redraw
			ctx.clearRect( 0, 0, liveCanvas.width, liveCanvas.height );
			renderPathsOnContext( ctx, [ updatedPath ] );
		},
		[ isDrawing, currentPath, getPointerPosition ]
	);

	const handlePointerUp = useCallback(
		( e: React.PointerEvent< HTMLCanvasElement > ) => {
			if ( ! isDrawing || ! currentPath ) {
				return;
			}

			e.preventDefault();

			// Commit path to committed canvas
			const committedCanvas = committedCanvasRef.current;
			if ( committedCanvas ) {
				const ctx = committedCanvas.getContext( '2d' );
				if ( ctx ) {
					renderPathsOnContext( ctx, [ currentPath ] );
				}
			}

			// Add to committed paths
			setCommittedPaths( [ ...committedPaths, currentPath ] );
			// Clear undo history  when a new path is committed
			setUndonePaths( [] );

			// Reset drawing state
			setCurrentPath( null );
			setIsDrawing( false );

			// Release pointer
			liveCanvasRef.current?.releasePointerCapture( e.pointerId );
		},
		[ isDrawing, currentPath, committedPaths ]
	);

	const handlePointerLeave = useCallback(
		( e: React.PointerEvent< HTMLCanvasElement > ) => {
			if ( isDrawing ) {
				handlePointerUp( e );
			}
		},
		[ isDrawing, handlePointerUp ]
	);

	const { setAnnotationCanvasRef } = useDispatch( imageStudioStore ) as ImageStudioActions;

	const clearCanvas = useCallback( ( canvas: HTMLCanvasElement ) => {
		const ctx = canvas.getContext( '2d' );
		if ( ctx ) {
			ctx.clearRect( 0, 0, canvas.width, canvas.height );
		}
	}, [] );

	const updateCanvases = useCallback(
		( paths: AnnotationPath[] ) => {
			const committedCanvas = committedCanvasRef.current;
			const liveCanvas = liveCanvasRef.current;

			// Clear and redraw committed canvas with the updated paths
			if ( committedCanvas ) {
				clearCanvas( committedCanvas );
				renderPathsOnContext( committedCanvas.getContext( '2d' )!, paths );
			}

			// Clear live canvas
			if ( liveCanvas ) {
				clearCanvas( liveCanvas );
			}
		},
		[ clearCanvas ]
	);

	// Expose methods via store for external control
	useEffect( () => {
		// Store reference to canvas functions in Redux store
		setAnnotationCanvasRef( {
			clear: () => {
				setCommittedPaths( [] );
				setCurrentPath( null );
				setUndonePaths( [] );

				const committedCanvas = committedCanvasRef.current;
				const liveCanvas = liveCanvasRef.current;

				if ( committedCanvas ) {
					clearCanvas( committedCanvas );
				}

				if ( liveCanvas ) {
					clearCanvas( liveCanvas );
				}
			},
			undo: () => {
				// Nothing to undo
				if ( committedPaths.length === 0 ) {
					return;
				}

				// Remove the last path from the array of committed paths
				const lastPath = committedPaths[ committedPaths.length - 1 ];
				const updatedPaths = committedPaths.slice( 0, -1 );

				setCommittedPaths( updatedPaths );
				setUndonePaths( [ ...undonePaths, lastPath ] );
				updateCanvases( updatedPaths );
			},
			redo: () => {
				// Nothing to redo
				if ( undonePaths.length === 0 ) {
					return;
				}

				// Get the last undone path
				const pathToRedo = undonePaths[ undonePaths.length - 1 ];
				const updatedUndonePaths = undonePaths.slice( 0, -1 );
				const updatedPaths = [ ...committedPaths, pathToRedo ];

				setUndonePaths( updatedUndonePaths );
				setCommittedPaths( updatedPaths );
				updateCanvases( updatedPaths );
			},

			getBlob: () => {
				return new Promise< Blob | null >( ( resolve ) => {
					if ( committedPaths.length === 0 ) {
						resolve( null );
						return;
					}

					window.console?.log?.(
						'[Annotation Canvas] Getting blob with imageUrl:',
						imageUrl,
						'imageElement.src:',
						imageElement?.src
					);

					// Create output canvas at original resolution (or best available fallback)
					const committedCanvas = committedCanvasRef.current;
					const fallbackWidth = committedCanvas?.width || displayDimensions.width;
					const fallbackHeight = committedCanvas?.height || displayDimensions.height;
					const outputWidth =
						originalDimensions.width || imageElement?.naturalWidth || fallbackWidth;
					const outputHeight =
						originalDimensions.height || imageElement?.naturalHeight || fallbackHeight;

					if ( ! outputWidth || ! outputHeight ) {
						resolve( null );
						return;
					}

					const outputCanvas = document.createElement( 'canvas' );
					outputCanvas.width = outputWidth;
					outputCanvas.height = outputHeight;

					const ctx = outputCanvas.getContext( '2d' );
					if ( ! ctx ) {
						resolve( null );
						return;
					}

					// Draw base image
					if ( imageElement ) {
						ctx.drawImage( imageElement, 0, 0, outputWidth, outputHeight );
					} else {
						ctx.fillStyle = '#ffffff';
						ctx.fillRect( 0, 0, outputWidth, outputHeight );
					}
					if ( committedCanvas ) {
						ctx.drawImage( committedCanvas, 0, 0, outputWidth, outputHeight );
					} else {
						// Fallback to re-rendering paths if canvas ref is missing
						renderPathsOnContext( ctx, committedPaths );
					}

					// Convert to blob
					outputCanvas.toBlob(
						( blob ) => {
							resolve( blob );
						},
						'image/png',
						0.92
					);
				} );
			},
			hasAnnotations: () => committedPaths.length > 0,
			hasUndoneAnnotations: () => undonePaths.length > 0,
		} );

		return () => {
			// Clean up store reference on unmount
			setAnnotationCanvasRef( null );
		};
	}, [
		committedPaths,
		undonePaths,
		originalDimensions,
		displayDimensions,
		imageElement,
		imageUrl,
		updateCanvases,
		clearCanvas,
		setAnnotationCanvasRef,
	] );

	return (
		<>
			<canvas
				ref={ committedCanvasRef }
				className="annotation-canvas annotation-canvas-committed"
				role="img"
				aria-label={ __( 'Saved annotation markings', 'big-sky' ) }
			/>
			<canvas
				ref={ liveCanvasRef }
				aria-label={ __( 'Interactive drawing area for creating image annotations', 'big-sky' ) }
				className="annotation-canvas annotation-canvas-live annotation-canvas-pen"
				onPointerDown={ handlePointerDown }
				onPointerMove={ handlePointerMove }
				onPointerUp={ handlePointerUp }
				onPointerLeave={ handlePointerLeave }
			/>
		</>
	);
}
