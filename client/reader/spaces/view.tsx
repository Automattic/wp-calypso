import page from '@automattic/calypso-router';
import { Button, __experimentalHStack as HStack } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import NavigationHeader from 'calypso/components/navigation-header';
import ReaderMain from 'calypso/reader/components/reader-main';
import { useSpaces } from 'calypso/reader/data/spaces';
import { CustomizeModal } from 'calypso/reader/spaces/customize-modal';
import { SpaceFeed } from 'calypso/reader/spaces/feed';
import { SourcesModal } from 'calypso/reader/spaces/sources-modal';
import { getManageSourcesPath, getSpacePath, MANAGE_SOURCES_HASH } from './routes';

import './style.scss';

interface Props {
	id?: string;
}

const getCurrentHash = () => ( typeof window === 'undefined' ? '' : window.location.hash );

export function SpacesView( { id }: Props ) {
	const translate = useTranslate();
	const spaces = useSpaces();
	const space = id ? spaces.find( ( item ) => item.id === id ) : undefined;
	const title = space ? space.name : translate( 'Spaces' );
	// POC: the space feed currently shows the discover content, so label it as such
	// after the space name in the header.
	const headerTitle = space ? (
		<>
			{ space.name }{ ' ' }
			<span className="reader-spaces__section-label">{ translate( 'Discover' ) }</span>
		</>
	) : (
		title
	);
	const [ hash, setHash ] = useState( getCurrentHash );
	const [ isCustomizeOpen, setIsCustomizeOpen ] = useState( false );
	const shouldShowSourcesModal = Boolean( id && space && hash === MANAGE_SOURCES_HASH );

	useEffect( () => {
		const handleHashChange = () => setHash( getCurrentHash() );

		handleHashChange();
		window.addEventListener( 'hashchange', handleHashChange );

		return () => window.removeEventListener( 'hashchange', handleHashChange );
	}, [] );

	const handleManageSources = () => {
		if ( ! id ) {
			return;
		}
		page( getManageSourcesPath( id ) );
		setHash( MANAGE_SOURCES_HASH );
	};

	const handleCloseSourcesModal = () => {
		if ( ! id ) {
			return;
		}
		page.replace( getSpacePath( id ) );
		setHash( '' );
	};

	return (
		<ReaderMain className="reader-spaces">
			<DocumentHead
				title={ translate( '%s ‹ Reader', {
					args: title,
					comment: '%s is the space name, or "Spaces" for the landing view',
					textOnly: true,
				} ) }
			/>
			<NavigationHeader title={ headerTitle }>
				{ space ? (
					<HStack spacing={ 2 } justify="flex-end" expanded={ false }>
						<Button
							__next40pxDefaultSize
							variant="secondary"
							onClick={ () => setIsCustomizeOpen( true ) }
						>
							{ translate( 'Customize' ) }
						</Button>
						<Button __next40pxDefaultSize variant="secondary" onClick={ handleManageSources }>
							{ translate( 'Manage sources' ) }
						</Button>
					</HStack>
				) : null }
			</NavigationHeader>
			{ id && space ? <SpaceFeed spaceId={ id } /> : null }
			<CustomizeModal
				isOpen={ isCustomizeOpen }
				spaceId={ id ?? null }
				onClose={ () => setIsCustomizeOpen( false ) }
			/>
			<SourcesModal
				isOpen={ shouldShowSourcesModal }
				spaceId={ id ?? null }
				onClose={ handleCloseSourcesModal }
			/>
		</ReaderMain>
	);
}
