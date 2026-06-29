import { readSpaceQuery } from '@automattic/api-queries';
import page from '@automattic/calypso-router';
import { useQueryClient } from '@tanstack/react-query';
import { Icon, category } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import ExpandableSidebarMenu from 'calypso/layout/sidebar/expandable';
import { useSpaces } from 'calypso/reader/data/spaces';
import { prefetchInfiniteStream } from 'calypso/reader/data/stream';
import { AddMenuItem } from 'calypso/reader/sidebar/menu';
import { CreateSpaceModal } from 'calypso/reader/spaces/create-modal';
import { getSpacePath, SPACES_BASE_PATH } from 'calypso/reader/spaces/routes';
import { useDispatch } from 'calypso/state';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import { SpaceMenuItem } from './menu-item';
import type { ReadSpace } from '@automattic/api-core';

import './style.scss';

interface Props {
	path: string;
}

function getActiveSpaceId( path: string ): string | null {
	// Space ids are URL-safe (base36), so the path segment is the id verbatim —
	// no decoding is needed, and there is nothing for a bad URL to throw on.
	// Mirrors getActiveConnection in the Social Feeds section.
	const match = path.match( /^\/reader\/spaces\/([^/?]+)/ );
	return match ? match[ 1 ] : null;
}

export function ReaderSidebarSpaces( { path }: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const queryClient = useQueryClient();
	const spaces = useSpaces();

	const activeId = getActiveSpaceId( path );
	const isOnSpaces = path === SPACES_BASE_PATH || path.startsWith( `${ SPACES_BASE_PATH }/` );

	const [ isOpen, setIsOpen ] = useState( () => isOnSpaces );
	const [ isCreateModalOpen, setIsCreateModalOpen ] = useState( false );

	useEffect( () => {
		if ( isOnSpaces ) {
			setIsOpen( true );
		}
	}, [ isOnSpaces ] );

	const recordSpaceClick = ( id: string ) => {
		dispatch( recordReaderTracksEvent( 'calypso_reader_sidebar_space_clicked', { space: id } ) );
	};

	// Warm the feed on hover/focus so the view paints from cache on click. The
	// stream query's 5-minute staleTime makes repeated hovers cheap no-ops.
	const prefetchSpace = ( id: string ) => {
		// Skip the space we're already viewing — its data is loaded (or loading).
		if ( id === activeId ) {
			return;
		}
		void prefetchInfiniteStream( queryClient, dispatch, {
			streamKey: `space:${ id }`,
			enabled: true,
		} );
		void queryClient.prefetchQuery( readSpaceQuery( id ) );
	};

	const handleAddSpaceClick = () => {
		dispatch( recordReaderTracksEvent( 'calypso_reader_sidebar_spaces_add_clicked' ) );
		setIsCreateModalOpen( true );
	};

	const handleSpaceCreated = ( space: ReadSpace ) => {
		page( getSpacePath( space.id ) );
	};

	return (
		<li>
			<ExpandableSidebarMenu
				expanded={ isOpen }
				title={ translate( 'Spaces' ) }
				customIcon={ <Icon className="sidebar__menu-icon" icon={ category } /> }
				expandableIconClick={ () => setIsOpen( ! isOpen ) }
				disableFlyout
				className={ ! isOpen && isOnSpaces ? 'sidebar__menu--selected' : undefined }
				count={ undefined }
				icon={ null }
				materialIcon={ null }
				materialIconStyle={ null }
			>
				{ spaces.map( ( space ) => (
					<SpaceMenuItem
						key={ space.id }
						space={ space }
						isSelected={ activeId === space.id }
						onClick={ () => recordSpaceClick( space.id ) }
						onPrefetch={ () => prefetchSpace( space.id ) }
					/>
				) ) }
				<AddMenuItem label={ translate( 'Add a space' ) } onClick={ handleAddSpaceClick } />
			</ExpandableSidebarMenu>
			<CreateSpaceModal
				isOpen={ isCreateModalOpen }
				onClose={ () => setIsCreateModalOpen( false ) }
				onCreated={ handleSpaceCreated }
			/>
		</li>
	);
}
