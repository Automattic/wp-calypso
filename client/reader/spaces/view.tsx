import { Button, __experimentalHStack as HStack } from '@wordpress/components';
import { settings } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useState, type ReactNode } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import NavigationHeader from 'calypso/components/navigation-header';
import ReaderMain from 'calypso/reader/components/reader-main';
import { useSpaces } from 'calypso/reader/data/spaces';
import { CustomizeModal, type CustomizeTab } from 'calypso/reader/spaces/customize-modal';
import { SpaceFeed } from 'calypso/reader/spaces/feed';
import { SpaceNavigation } from 'calypso/reader/spaces/space-navigation';
import type { SpaceFeedLayout } from '@automattic/api-core';
import type { SpaceTab } from 'calypso/reader/spaces/routes';

import './style.scss';

interface Props {
	id?: string;
	tab?: SpaceTab;
}

export function SpacesView( { id, tab = 'feed' }: Props ) {
	const translate = useTranslate();
	const spaces = useSpaces();
	const space = id ? spaces.find( ( item ) => item.id === id ) : undefined;
	const layoutView: SpaceFeedLayout | undefined = space?.layout.view;
	const title = space ? space.name : translate( 'Spaces' );
	// The generic "Spaces" heading belongs to the landing page only — while a
	// specific space is still loading, render no heading rather than flashing it.
	let headerTitle: string = '';
	if ( space ) {
		headerTitle = space.name;
	} else if ( ! id ) {
		headerTitle = translate( 'Spaces' );
	}
	// Which tab the unified Customize modal opens on, or `null` when it's closed.
	const [ customizeTab, setCustomizeTab ] = useState< CustomizeTab | null >( null );

	const handleClose = () => {
		setCustomizeTab( null );
	};

	let activePanel: ReactNode = null;
	if ( id && space ) {
		activePanel =
			tab === 'discover' ? (
				<SpaceFeed spaceId={ id } layoutView={ layoutView } variant="discover" />
			) : (
				<SpaceFeed spaceId={ id } layoutView={ layoutView } />
			);
	}

	return (
		<ReaderMain className="reader-spaces">
			<DocumentHead
				title={ translate( '%s ‹ Reader', {
					args: title,
					comment: '%s is the space name, or "Spaces" for the landing view',
					textOnly: true,
				} ) }
			/>
			<NavigationHeader
				title={ headerTitle }
				subtitle={ space ? translate( 'Your curated reading space' ) : undefined }
			>
				{ space ? (
					<HStack spacing={ 2 } justify="flex-end" expanded={ false }>
						<Button
							__next40pxDefaultSize
							variant="secondary"
							icon={ settings }
							onClick={ () => setCustomizeTab( 'identity' ) }
						>
							{ translate( 'Customize' ) }
						</Button>
					</HStack>
				) : null }
			</NavigationHeader>
			{ id && space ? <SpaceNavigation spaceId={ id } selectedTab={ tab } /> : null }
			{ activePanel }
			<CustomizeModal
				isOpen={ customizeTab !== null }
				spaceId={ id ?? null }
				initialTab={ customizeTab ?? 'identity' }
				onClose={ handleClose }
			/>
		</ReaderMain>
	);
}
