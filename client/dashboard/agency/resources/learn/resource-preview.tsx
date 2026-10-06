import {
	Button,
	Modal,
	VisuallyHidden,
	__experimentalHeading as Heading,
	__experimentalHStack as HStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { chevronLeft, chevronRight, closeSmall } from '@wordpress/icons';
import { Badge } from '@wordpress/ui';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import ResourceDetailArtwork from './resource-detail-artwork';
import { getResourceDownload } from './resource-download';
import { getResourceTags } from './resource-presentation';
import ResourceReadButton from './resource-read-button';
import type { LibraryResource } from './types';
import type { MouseEvent } from 'react';
import './resource-detail-artwork.scss';

export default function ResourcePreview( {
	resource,
	origin,
	previousResource,
	nextResource,
	onPrevious,
	onNext,
	onClose,
	onFilter,
	isRead = false,
	readError = false,
	onToggleRead,
}: {
	resource: LibraryResource;
	isRead?: boolean;
	readError?: boolean;
	onToggleRead?: () => void;
	origin: DOMRect | null;
	previousResource?: LibraryResource;
	nextResource?: LibraryResource;
	onPrevious?: () => void;
	onNext?: () => void;
	onClose: () => void;
	onFilter: ( field: string, value: string ) => void;
} ) {
	const [ copyState, setCopyState ] = useState( '' );
	const [ hasNavigated, setHasNavigated ] = useState( false );
	const navigateResource = ( navigate?: () => void ) => {
		if ( navigate ) {
			setHasNavigated( true );
			navigate();
		}
	};
	const [ downloadError, setDownloadError ] = useState( '' );
	useEffect( () => {
		setCopyState( '' );
		setDownloadError( '' );
	}, [ resource.id ] );
	useEffect( () => {
		if ( copyState !== __( 'Link copied' ) ) {
			return;
		}
		const timeout = window.setTimeout( () => setCopyState( '' ), 2000 );
		return () => window.clearTimeout( timeout );
	}, [ copyState ] );
	const download = getResourceDownload( resource );
	const downloadLabel = download?.exportFormat
		? { PDF: __( 'Download PDF' ), XLSX: __( 'Download spreadsheet' ) }[ download.exportFormat ]
		: __( 'Download' );
	const contentRef = useRef< HTMLDivElement >( null );
	useLayoutEffect( () => {
		const frame = contentRef.current?.closest< HTMLElement >( '.components-modal__frame' );
		if ( ! frame ) {
			return;
		}
		const openingHeight = frame.getBoundingClientRect().height;
		const positionModal = () => {
			const top = Math.max( 16, ( window.innerHeight - openingHeight ) / 2 );
			frame.style.setProperty( '--resource-modal-top', `${ top }px` );
		};
		positionModal();
		window.addEventListener( 'resize', positionModal );
		return () => window.removeEventListener( 'resize', positionModal );
	}, [] );

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
			className="resource-preview resource-preview-details"
			overlayClassName="resource-preview-overlay"
			contentLabel={ resource.title }
			__experimentalHideHeader
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
						navigateResource( onPrevious );
					} else {
						navigateResource( onNext );
					}
				}
			} }
		>
			<div
				className="resource-preview-layout"
				data-product={ resource.product }
				data-preview-transition={ hasNavigated ? 'fade' : 'enter' }
				ref={ contentRef }
			>
				<div className="resource-preview-heading-scope">
					<header className="resource-preview-header">
						<div className="resource-preview-heading-row">
							<div className="resource-preview-heading-copy">
								<Heading level={ 1 } className="resource-preview-title" dir="auto">
									{ resource.title }
								</Heading>
							</div>
							<Button
								className="resource-preview-close"
								icon={ closeSmall }
								size="compact"
								label={ __( 'Close' ) }
								onClick={ onClose }
							/>
						</div>
						{ resource.description && (
							<HStack className="resource-preview-summary" spacing={ 4 } alignment="top" wrap>
								<Text dir="auto">{ resource.description }</Text>
							</HStack>
						) }
						<HStack
							className="resource-preview-action-row"
							role="group"
							aria-label={ __( 'Resource actions and filters' ) }
							alignment="center"
							justify="space-between"
							spacing={ 3 }
							wrap
						>
							<HStack
								className="resource-preview-actions"
								wrap
								spacing={ 2 }
								justify="start"
								expanded={ false }
							>
								{ download && (
									<Button
										variant="primary"
										size="compact"
										href={ download.url }
										target="_blank"
										rel="noopener noreferrer"
										download={ download.filename }
										onClick={ async ( event: MouseEvent< HTMLAnchorElement > ) => {
											if ( ! download.fetchFile ) {
												return;
											}
											event.preventDefault();
											setDownloadError( '' );
											try {
												const response = await fetch( download.url );
												if ( ! response.ok ) {
													throw new Error( 'Download failed' );
												}
												const url = URL.createObjectURL( await response.blob() );
												const anchor = window.document.createElement( 'a' );
												anchor.href = url;
												anchor.download = download.filename ?? resource.title;
												anchor.click();
												window.setTimeout( () => URL.revokeObjectURL( url ), 1000 );
											} catch {
												setDownloadError(
													__( 'Download failed. Open the resource in a new tab to save it.' )
												);
											}
										} }
									>
										{ downloadLabel }
									</Button>
								) }
								<Button
									variant={ download ? 'secondary' : 'primary' }
									size="compact"
									href={ resource.url }
									target="_blank"
									rel="noopener noreferrer"
								>
									{ __( 'Open in new tab' ) }
								</Button>
								<Button
									variant="tertiary"
									className="resource-preview-copy-link"
									label={ copyState || __( 'Copy link' ) }
									showTooltip={ false }
									size="compact"
									onClick={ async () => {
										try {
											await navigator.clipboard.writeText( window.location.href );
											setCopyState( __( 'Link copied' ) );
										} catch {
											setCopyState( __( 'Copy the link from your address bar.' ) );
										}
									} }
								>
									<span>{ copyState === __( 'Link copied' ) ? copyState : __( 'Copy link' ) }</span>
								</Button>
								{ onToggleRead && (
									<ResourceReadButton isRead={ isRead } onChange={ onToggleRead } />
								) }
							</HStack>
							<HStack
								className="resource-preview-metadata"
								spacing={ 2 }
								justify="end"
								expanded={ false }
								wrap
							>
								{ getResourceTags( resource ).map( ( { field, value } ) => (
									<button
										key={ field }
										type="button"
										className="resource-preview-tag-button"
										aria-label={ sprintf(
											/* translators: %s is a resource tag. */
											__( 'Filter by %s' ),
											value
										) }
										onClick={ () => onFilter( field, value ) }
									>
										<Badge intent={ field === 'featured' ? 'informational' : 'draft' }>
											{ value }
										</Badge>
									</button>
								) ) }
							</HStack>
						</HStack>
					</header>
				</div>
				<VisuallyHidden>
					<span role="status">{ copyState }</span>
				</VisuallyHidden>
				{ readError && (
					<Text role="alert">
						{ __(
							'Could not save your reading status. Please allow browser storage and try again.'
						) }
					</Text>
				) }
				{ downloadError && (
					<p className="resource-detail-error" role="alert">
						{ downloadError }
					</p>
				) }
				<div className="resource-detail-visual" key={ resource.id }>
					<ResourceDetailArtwork resource={ resource } />
				</div>
			</div>
			{ ( previousResource || nextResource ) && (
				<div
					className="resource-preview-navigation"
					role="group"
					aria-label={ __( 'Resource navigation' ) }
				>
					<Button
						size="compact"
						icon={ chevronLeft }
						label={ __( 'Previous resource' ) }
						disabled={ ! previousResource }
						onClick={ () => navigateResource( onPrevious ) }
					/>
					<Button
						size="compact"
						icon={ chevronRight }
						label={ __( 'Next resource' ) }
						disabled={ ! nextResource }
						onClick={ () => navigateResource( onNext ) }
					/>
				</div>
			) }
		</Modal>
	);
}
