import { Button, __experimentalHStack as HStack } from '@wordpress/components';
import { settings } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState, type ReactNode } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import NavigationHeader from 'calypso/components/navigation-header';
import ReaderMain from 'calypso/reader/components/reader-main';
import { useSpaces } from 'calypso/reader/data/spaces';
import { CustomizeModal, type CustomizeTab } from 'calypso/reader/spaces/customize-modal';
import { DEFAULT_SPACE_WIDTH } from 'calypso/reader/spaces/customize-modal/layout-tab';
import { SpaceFeed } from 'calypso/reader/spaces/feed';
import { DEFAULT_SPACE_FEED_LAYOUT } from 'calypso/reader/spaces/feed/layouts/registry';
import { SpaceNavigation } from 'calypso/reader/spaces/space-navigation';
import { useDispatch } from 'calypso/state';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import type { SpaceFeedLayout } from '@automattic/api-core';
import type { SpaceTab } from 'calypso/reader/spaces/routes';

import './style.scss';

interface Props {
	id?: string;
	tab?: SpaceTab;
}

export function SpacesView( { id, tab = 'feed' }: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const spaces = useSpaces();
	const space = id ? spaces.find( ( item ) => item.id === id ) : undefined;
	const layoutView: SpaceFeedLayout = space?.layout.view ?? DEFAULT_SPACE_FEED_LAYOUT;
	const isWide = ( space?.layout.width ?? DEFAULT_SPACE_WIDTH ) === 'wide';
	const icon = space?.layout.icon;
	const color = space?.layout.color;
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

	useEffect( () => {
		if ( ! id || ! icon || ! color ) {
			return;
		}

		dispatch(
			recordReaderTracksEvent( 'calypso_reader_spaces_page_viewed', {
				space_id: id,
				layout: layoutView,
				icon,
				color,
				tab,
			} )
		);
	}, [ color, dispatch, icon, id, layoutView, tab ] );

	let activePanel: ReactNode = null;
	if ( id && space ) {
		activePanel =
			tab === 'discover' ? (
				<SpaceFeed spaceId={ id } layoutView={ layoutView } variant="discover" />
			) : (
				<SpaceFeed
					spaceId={ id }
					layoutView={ layoutView }
					onAddSources={ () => {
						dispatch(
							recordReaderTracksEvent( 'calypso_reader_spaces_add_sources_clicked', {
								space_id: id,
							} )
						);
						setCustomizeTab( 'sources' );
					} }
				/>
			);
	}

	return (
		<ReaderMain className="reader-spaces" wideLayout={ isWide }>
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
							variant="tertiary"
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
