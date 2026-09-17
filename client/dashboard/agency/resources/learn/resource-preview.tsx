import {
	Button,
	Modal,
	__experimentalHStack as HStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { external, link, download, chevronLeft, chevronRight } from '@wordpress/icons';
import { Badge } from '@wordpress/ui';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { sampleDocuments } from './sample-documents';
import type { sampleResources } from './sample-resources';

type Resource = ( typeof sampleResources )[ number ];

export default function ResourcePreview( {
	resource,
	origin,
	previousResource,
	nextResource,
	onPrevious,
	onNext,
	onClose,
	onFilter,
}: {
	resource: Resource;
	origin: DOMRect | null;
	previousResource?: Resource;
	nextResource?: Resource;
	onPrevious?: () => void;
	onNext?: () => void;
	onClose: () => void;
	onFilter: ( field: string, value: string ) => void;
} ) {
	const [ copyState, setCopyState ] = useState( '' );
	useEffect( () => {
		setCopyState( '' );
	}, [ resource.id ] );
	const [ page, setPage ] = useState( 0 );
	useEffect( () => setPage( 0 ), [ resource.id ] );
	const document = sampleDocuments[ resource.id ];
	const pages = document?.pages ?? [];
	const isVideo = resource.format === 'Video';
	const documentUrl = isVideo ? resource.url : document?.url;
	const contentRef = useRef< HTMLDivElement >( null );
	useLayoutEffect( () => {
		const frame = contentRef.current?.closest( '.components-modal__frame' );
		if ( ! frame || window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches ) {
			return;
		}
		const bounds = frame.getBoundingClientRect();
		const transform = origin
			? `translate(${ origin.x + origin.width / 2 - bounds.x - bounds.width / 2 }px, ${
					origin.y + origin.height / 2 - bounds.y - bounds.height / 2
			  }px) scale(${ origin.width / bounds.width }, ${ origin.height / bounds.height })`
			: 'scale(0.96)';
		const animation = frame.animate(
			[
				{ transform, opacity: 0.35 },
				{ transform: 'translate(0, 0) scale(1)', opacity: 1 },
			],
			{ duration: 120, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }
		);
		return () => animation.cancel();
	}, [ origin ] );
	return (
		<Modal
			className="resource-preview"
			overlayClassName="resource-preview-overlay"
			title={ resource.title }
			size="large"
			onRequestClose={ onClose }
			onKeyDown={ ( event ) => {
				if (
					event.defaultPrevented ||
					event.altKey ||
					event.ctrlKey ||
					event.metaKey ||
					event.shiftKey ||
					( event.target instanceof Element &&
						event.target.closest(
							'input, textarea, select, video, audio, [contenteditable]:not([contenteditable="false"]), [role="slider"]'
						) )
				) {
					return;
				}
				if ( event.key === 'ArrowLeft' || event.key === 'ArrowRight' ) {
					event.preventDefault();
					if ( event.key === 'ArrowLeft' ) {
						onPrevious?.();
					} else {
						onNext?.();
					}
				}
			} }
		>
			<div className="resource-preview-layout" ref={ contentRef }>
				<HStack className="resource-preview-summary" spacing={ 4 } alignment="top" wrap>
					<Text>{ resource.description }</Text>
				</HStack>
				<HStack
					className="resource-preview-action-row"
					alignment="bottom"
					justify="space-between"
					spacing={ 3 }
					wrap
				>
					<HStack
						className="resource-preview-actions"
						spacing={ 2 }
						justify="start"
						expanded={ false }
					>
						{ ! isVideo && (
							<Button
								variant="tertiary"
								size="compact"
								icon={ download }
								href={ documentUrl }
								download={ `${ resource.title }.pdf` }
							>
								{ __( 'Download' ) }
							</Button>
						) }
						<Button
							variant="tertiary"
							className="resource-preview-mobile-icon has-text"
							label={ copyState || __( 'Copy link' ) }
							size="compact"
							icon={ link }
							onClick={ async () => {
								try {
									await navigator.clipboard.writeText( window.location.href );
									setCopyState( __( 'Link copied' ) );
								} catch {
									setCopyState( __( 'Copy the link from your address bar.' ) );
								}
							} }
						>
							<span className="resource-preview-action-label">
								{ copyState === __( 'Link copied' ) ? copyState : __( 'Copy link' ) }
							</span>
						</Button>
						<Button
							variant="tertiary"
							className="resource-preview-mobile-icon has-text"
							label={ __( 'Open in tab' ) }
							size="compact"
							href={ documentUrl }
							target="_blank"
							rel="noopener noreferrer"
							icon={ external }
						>
							<span className="resource-preview-action-label">{ __( 'Open in tab' ) }</span>
						</Button>
					</HStack>
					<HStack spacing={ 2 } justify="end" expanded={ false } wrap>
						{ ( [ 'format', 'audience', 'product' ] as const ).map( ( field ) => (
							<button
								key={ field }
								type="button"
								className="resource-preview-tag-button"
								aria-label={ sprintf(
									/* translators: %s is a resource tag. */
									__( 'Filter by %s' ),
									resource[ field ]
								) }
								onClick={ () => onFilter( field, resource[ field ] ) }
							>
								<Badge className="resource-preview-tag" intent="draft">
									{ resource[ field ] }
								</Badge>
							</button>
						) ) }
					</HStack>
				</HStack>
				<span role="status" className="screen-reader-text">
					{ copyState }
				</span>
				<div className="resource-preview-media" key={ resource.id }>
					{ isVideo ? (
						// The sample clip has no speech requiring captions.
						// eslint-disable-next-line jsx-a11y/media-has-caption
						<video
							controls
							playsInline
							preload="metadata"
							src={ resource.url }
							aria-label={ resource.title }
						/>
					) : (
						<div className="resource-pdf-viewer">
							<div className="resource-pdf-page" key={ `${ resource.id }-${ page }` }>
								<img src={ pages[ page ] } alt={ `${ resource.title }, ${ page + 1 }` } />
							</div>
							{ pages.length > 1 && (
								<nav className="resource-pdf-thumbnails" aria-label={ __( 'PDF pages' ) }>
									{ pages.map( ( src, index ) => (
										<Button
											key={ src }
											className="resource-pdf-thumbnail"
											aria-current={ page === index ? 'page' : undefined }
											aria-label={ sprintf(
												/* translators: %d: PDF page number. */ __( 'Page %d' ),
												index + 1
											) }
											onClick={ () => setPage( index ) }
										>
											<img src={ src } alt="" loading="lazy" />
											<span>{ index + 1 }</span>
										</Button>
									) ) }
								</nav>
							) }
						</div>
					) }
				</div>

				<HStack className="resource-preview-navigation" spacing={ 3 }>
					<Button
						size="compact"
						icon={ chevronLeft }
						aria-label={ __( 'Previous resource' ) }
						disabled={ ! onPrevious }
						onClick={ onPrevious }
					>
						<span className="resource-preview-neighbor">
							<span className="resource-preview-neighbor-meta">
								{ __( 'Previous' ) }
								{ previousResource && <span>{ ` · ${ previousResource.format }` }</span> }
							</span>
							<span className="resource-preview-neighbor-title">
								{ previousResource?.title ?? __( 'First resource' ) }
							</span>
						</span>
					</Button>

					<Button
						size="compact"
						icon={ chevronRight }
						aria-label={ __( 'Next resource' ) }
						iconPosition="right"
						disabled={ ! onNext }
						onClick={ onNext }
					>
						<span className="resource-preview-neighbor">
							<span className="resource-preview-neighbor-meta">
								{ __( 'Next' ) }
								{ nextResource && <span>{ ` · ${ nextResource.format }` }</span> }
							</span>
							<span className="resource-preview-neighbor-title">
								{ nextResource?.title ?? __( 'Last resource' ) }
							</span>
						</span>
					</Button>
				</HStack>
			</div>
		</Modal>
	);
}
