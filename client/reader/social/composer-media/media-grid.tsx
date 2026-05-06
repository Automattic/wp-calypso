import './style.scss';

import { Button, Spinner } from '@wordpress/components';
import { Icon, closeSmall, image as imageIcon } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useRef } from 'react';
import { AltTextPopover } from './alt-text-popover';
import type { ReactNode } from 'react';

export interface MediaGridItem {
	localId: string;
	previewUrl: string;
	alt: string;
}

interface Props< T extends MediaGridItem > {
	items: T[];
	max: number;
	accept: string;
	onPickFiles: ( files: File[] ) => void;
	onRemove: ( localId: string ) => void;
	onSetAlt: ( localId: string, alt: string ) => void;
	onRetry?: ( localId: string ) => void;
	isPending: ( item: T ) => boolean;
	canEditAlt: ( item: T ) => boolean;
	isFailed: ( item: T ) => boolean;
	errorMessage?: ( item: T ) => ReactNode | null;
}

export function MediaGrid< T extends MediaGridItem >( {
	items,
	max,
	accept,
	onPickFiles,
	onRemove,
	onSetAlt,
	onRetry,
	isPending,
	canEditAlt,
	isFailed,
	errorMessage,
}: Props< T > ) {
	const translate = useTranslate();
	const inputRef = useRef< HTMLInputElement >( null );

	if ( items.length === 0 ) {
		return null;
	}

	return (
		<div
			className="social-composer__media-grid"
			role="group"
			aria-label={ translate( 'Attached images' ) as string }
		>
			{ items.map( ( item ) => (
				<Thumbnail
					key={ item.localId }
					item={ item }
					onRemove={ onRemove }
					onRetry={ onRetry }
					onSetAlt={ onSetAlt }
					isPending={ isPending }
					canEditAlt={ canEditAlt }
					isFailed={ isFailed }
					errorMessage={ errorMessage }
				/>
			) ) }
			{ items.length < max && (
				<>
					<button
						type="button"
						className="social-composer__media-add"
						aria-label={ translate( 'Add more images' ) as string }
						onClick={ () => inputRef.current?.click() }
					>
						<Icon icon={ imageIcon } size={ 24 } />
					</button>
					<input
						ref={ inputRef }
						type="file"
						accept={ accept }
						multiple
						hidden
						onChange={ ( e ) => {
							const files = Array.from( e.target.files ?? [] );
							if ( files.length > 0 ) {
								onPickFiles( files );
							}
							// Reset so picking the same file again still triggers onChange.
							e.target.value = '';
						} }
					/>
				</>
			) }
		</div>
	);
}

function Thumbnail< T extends MediaGridItem >( {
	item,
	onRemove,
	onRetry,
	onSetAlt,
	isPending,
	canEditAlt,
	isFailed,
	errorMessage,
}: {
	item: T;
	onRemove: ( id: string ) => void;
	onRetry?: ( id: string ) => void;
	onSetAlt: ( id: string, alt: string ) => void;
	isPending: ( item: T ) => boolean;
	canEditAlt: ( item: T ) => boolean;
	isFailed: ( item: T ) => boolean;
	errorMessage?: ( item: T ) => ReactNode | null;
} ) {
	const translate = useTranslate();
	const failed = isFailed( item );
	const pending = isPending( item );
	const editable = canEditAlt( item );
	const imgAlt = item.alt.length > 0 ? item.alt : ( translate( 'Attached image' ) as string );
	const errorNode = failed && errorMessage ? errorMessage( item ) : null;

	return (
		<div className={ clsx( 'social-composer__media-item', { 'is-failed': failed } ) }>
			{ item.previewUrl && <img src={ item.previewUrl } alt={ imgAlt } /> }
			{ pending && <Spinner /> }
			<button
				type="button"
				className="social-composer__media-remove"
				aria-label={ translate( 'Remove image' ) as string }
				onClick={ () => onRemove( item.localId ) }
			>
				<Icon icon={ closeSmall } size={ 16 } />
			</button>
			{ editable && (
				<div className="social-composer__media-alt">
					<AltTextPopover
						currentAlt={ item.alt }
						previewUrl={ item.previewUrl }
						onSave={ ( next ) => onSetAlt( item.localId, next ) }
					/>
				</div>
			) }
			{ failed && errorNode && (
				<div className="social-composer__media-error">
					<span>{ errorNode }</span>
					{ onRetry && (
						<Button variant="link" onClick={ () => onRetry( item.localId ) }>
							{ translate( 'Retry' ) }
						</Button>
					) }
				</div>
			) }
		</div>
	);
}
