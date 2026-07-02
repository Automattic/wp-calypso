import {
	getReadSpaceSourceKey,
	getSiteSubscriptionSourceKey,
	type ReadSpace,
	type SiteSubscriptionItem,
	type SpaceColor,
	type SpaceFeedLayout,
	type SpaceIcon,
	type SpaceSource,
	type SpaceTextColor,
} from '@automattic/api-core';
import page from '@automattic/calypso-router';
import {
	Button,
	Modal,
	TabPanel,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { Icon, close } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useMemo, useState } from 'react';
import {
	useCreateSpace,
	useDeleteSpace,
	useSpace,
	useSpaces,
	useUpdateSpace,
} from 'calypso/reader/data/spaces';
import {
	DEFAULT_SPACE_COLOR,
	DEFAULT_SPACE_TEXT_COLOR,
	resolveSpaceIconColor,
} from 'calypso/reader/spaces/colors';
import { getSpaceErrorMessage, validateName } from 'calypso/reader/spaces/form-helpers';
import { SPACE_ICONS } from 'calypso/reader/spaces/icons';
import { isKnownLanguageCode, toBaseLanguageCode } from 'calypso/reader/spaces/languages';
import { useDispatch, useSelector } from 'calypso/state';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import { successNotice } from 'calypso/state/notices/actions';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import { DEFAULT_SPACE_FEED_LAYOUT } from '../feed/layouts/registry';
import { ConfirmDeleteDialog } from './confirm-delete';
import { DeleteTab } from './delete-tab';
import { IdentityTab } from './identity-tab';
import { getLayoutPresetTitle, LayoutTab } from './layout-tab';
import { SourcesTab } from './sources-tab';

import './style.scss';

export type CustomizeTab = 'identity' | 'layout' | 'sources' | 'delete';

// Ties the hidden Modal header's accessible name to our custom visible heading.
const SPACE_MODAL_HEADING_ID = 'customize-space-modal__heading';

interface CustomizeModalProps {
	isOpen: boolean;
	spaceId: string | null;
	onClose: () => void;
	initialTab?: CustomizeTab;
}

export function CustomizeModal( {
	isOpen,
	spaceId,
	onClose,
	initialTab = 'identity',
}: CustomizeModalProps ) {
	return (
		<SpaceUpsertModal
			isOpen={ isOpen }
			mode="edit"
			spaceId={ spaceId }
			onClose={ onClose }
			initialTab={ initialTab }
		/>
	);
}

type SpaceUpsertMode = 'create' | 'edit';
type ModalTab = {
	name: CustomizeTab;
	title: string;
};

type SourceDraftItem = {
	key: string;
	feed: number | string;
};

const getSubscriptionFeed = ( subscription: SiteSubscriptionItem ): number | string =>
	subscription.feed_ID ?? subscription.feed_URL;

const getSubscriptionDraftItem = ( subscription: SiteSubscriptionItem ): SourceDraftItem => ( {
	key: getSiteSubscriptionSourceKey( subscription ),
	feed: getSubscriptionFeed( subscription ),
} );

const getSpaceSourceDraftItem = ( source: SpaceSource ): SourceDraftItem => ( {
	key: getReadSpaceSourceKey( source ),
	feed: source.feedId ?? source.feedUrl,
} );

interface SpaceUpsertModalProps {
	isOpen: boolean;
	mode: SpaceUpsertMode;
	spaceId?: string | null;
	onClose: () => void;
	onCreated?: ( space: ReadSpace ) => void;
	initialTab?: CustomizeTab;
}

export function SpaceUpsertModal( {
	isOpen,
	mode,
	spaceId = null,
	onClose,
	onCreated,
	initialTab = 'identity',
}: SpaceUpsertModalProps ) {
	// Mount fresh each open so the draft form state resets to the mode's values.
	if ( ! isOpen || ( mode === 'edit' && ! spaceId ) ) {
		return null;
	}

	return (
		<SpaceUpsertModalContent
			mode={ mode }
			spaceId={ spaceId }
			onClose={ onClose }
			onCreated={ onCreated }
			initialTab={ initialTab }
		/>
	);
}

function SpaceUpsertModalContent( {
	mode,
	spaceId,
	onClose,
	onCreated,
	initialTab,
}: {
	mode: SpaceUpsertMode;
	spaceId: string | null;
	onClose: () => void;
	onCreated?: ( space: ReadSpace ) => void;
	initialTab: CustomizeTab;
} ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const userLocale = useSelector( getCurrentUserLocale );
	const isCreate = mode === 'create';
	const editSpaceId = isCreate ? null : spaceId;
	const { data: space } = useSpace( editSpaceId, { enabled: ! isCreate } );
	const spaces = useSpaces();
	const createSpace = useCreateSpace();
	const updateSpace = useUpdateSpace();
	const deleteSpace = useDeleteSpace();

	// Draft state is seeded only once from the loaded detail so source mutations
	// cannot clobber unsaved identity/layout edits. Create mode is ready at mount.
	const [ isSeeded, setIsSeeded ] = useState( isCreate );
	const [ name, setName ] = useState( '' );
	const [ tags, setTags ] = useState< string[] >( [] );
	const [ color, setColor ] = useState< SpaceTextColor >( DEFAULT_SPACE_TEXT_COLOR );
	const [ iconColor, setIconColor ] = useState< SpaceColor >( DEFAULT_SPACE_COLOR );
	// New spaces pre-fill the user's account language (as a base code) so Discover
	// is on-language out of the box; edit mode seeds the saved set below.
	const [ languages, setLanguages ] = useState< string[] >( () => {
		if ( ! isCreate || ! userLocale ) {
			return [];
		}
		const base = toBaseLanguageCode( userLocale );
		return isKnownLanguageCode( base ) ? [ base ] : [];
	} );
	const [ icon, setIcon ] = useState< SpaceIcon >( 'inbox' );
	const [ view, setView ] = useState< SpaceFeedLayout >( DEFAULT_SPACE_FEED_LAYOUT );
	const [ selectedSources, setSelectedSources ] = useState< SourceDraftItem[] >( [] );
	const [ isConfirmingDelete, setIsConfirmingDelete ] = useState( false );

	useEffect( () => {
		if ( ! isCreate && space && ! isSeeded ) {
			setName( space.name );
			setTags( space.tags );
			// `?? []` guards a persisted React Query cache written before `languages`
			// shipped — the adapter always provides an array for fresh responses.
			setLanguages( space.languages ?? [] );
			setColor( space.layout.color );
			setIconColor( resolveSpaceIconColor( space.layout ) );
			setIcon( space.layout.icon );
			setView( space.layout.view ?? DEFAULT_SPACE_FEED_LAYOUT );
			setSelectedSources( space.sources.map( getSpaceSourceDraftItem ) );
			setIsSeeded( true );
		}
	}, [ isCreate, isSeeded, space ] );

	const existingNames = useMemo(
		() =>
			spaces.filter( ( item ) => isCreate || item.id !== editSpaceId ).map( ( item ) => item.name ),
		[ editSpaceId, isCreate, spaces ]
	);
	const nameError = validateName( name, existingNames, translate );
	const isPending = isCreate ? createSpace.isPending : updateSpace.isPending;
	const selectedFeeds = selectedSources.map( ( source ) => source.feed );

	const handleAddDraftSource = ( subscription: SiteSubscriptionItem ) => {
		const source = getSubscriptionDraftItem( subscription );
		setSelectedSources( ( previous ) =>
			previous.some( ( item ) => item.key === source.key ) ? previous : [ ...previous, source ]
		);
	};

	const handleRemoveDraftSource = ( subscription: SiteSubscriptionItem ) => {
		const sourceKey = getSiteSubscriptionSourceKey( subscription );
		setSelectedSources( ( previous ) => previous.filter( ( item ) => item.key !== sourceKey ) );
	};

	const handleSave = () => {
		if ( nameError || isPending ) {
			return;
		}

		if ( isCreate ) {
			createSpace.mutate(
				{
					name: name.trim(),
					tags,
					languages,
					layout: { color, iconColor, icon, view },
					feeds: selectedFeeds,
				},
				{
					onSuccess: ( createdSpace ) => {
						dispatch(
							recordReaderTracksEvent( 'calypso_reader_spaces_space_created', {
								tag_count: createdSpace.tags.length,
								language_count: createdSpace.languages.length,
								source_count: selectedFeeds.length,
								layout: view,
								icon,
								color,
								icon_color: iconColor,
							} )
						);
						dispatch(
							successNotice(
								translate( '%(name)s created.', { args: { name: createdSpace.name } } ),
								{ duration: 5000 }
							)
						);
						onCreated?.( createdSpace );
						onClose();
					},
				}
			);
			return;
		}

		if ( ! space || ! editSpaceId ) {
			return;
		}

		updateSpace.mutate(
			{
				spaceId: editSpaceId,
				params: {
					name: name.trim(),
					tags,
					languages,
					feeds: selectedFeeds,
					layout: { color, iconColor, icon, view },
				},
			},
			{
				onSuccess: () => {
					const previousView = space.layout.view ?? DEFAULT_SPACE_FEED_LAYOUT;
					if ( view !== previousView ) {
						dispatch(
							recordReaderTracksEvent( 'calypso_reader_spaces_layout_changed', { layout: view } )
						);
					}
					dispatch(
						recordReaderTracksEvent( 'calypso_reader_spaces_space_updated', {
							tag_count: tags.length,
							language_count: languages.length,
							source_count: selectedFeeds.length,
							layout: view,
						} )
					);
					dispatch( successNotice( translate( 'Changes saved.' ), { duration: 5000 } ) );
					onClose();
				},
			}
		);
	};

	const handleConfirmDelete = () => {
		if ( ! editSpaceId || deleteSpace.isPending ) {
			return;
		}
		deleteSpace.mutate( editSpaceId, {
			onSuccess: () => {
				dispatch( recordReaderTracksEvent( 'calypso_reader_spaces_space_deleted' ) );
				dispatch(
					successNotice(
						translate( '%(name)s deleted.', { args: { name: space?.name ?? name } } ),
						{ duration: 5000 }
					)
				);
				onClose();
				// We are viewing the now-deleted space, so send the user back to the Reader.
				page( '/reader' );
			},
		} );
	};

	const baseTabs: ModalTab[] = [
		{ name: 'identity', title: translate( 'Identity' ) as string },
		{ name: 'layout', title: translate( 'Layout' ) as string },
		{ name: 'sources', title: translate( 'Sources' ) as string },
	];
	const tabs: ModalTab[] = isCreate
		? baseTabs
		: [ ...baseTabs, { name: 'delete', title: translate( 'Delete' ) as string } ];

	const renderTab = ( tabName: CustomizeTab ) => {
		if ( ! isSeeded ) {
			return (
				<p className="customize-space-modal__loading" role="status">
					{ translate( 'Loading…' ) }
				</p>
			);
		}
		if ( tabName === 'layout' ) {
			return <LayoutTab value={ view } onChange={ setView } />;
		}
		if ( tabName === 'sources' ) {
			return (
				<SourcesTab
					selectedSourceKeys={ selectedSources.map( ( source ) => source.key ) }
					onAddDraftSource={ handleAddDraftSource }
					onRemoveDraftSource={ handleRemoveDraftSource }
				/>
			);
		}
		if ( tabName === 'delete' && ! isCreate ) {
			return (
				<DeleteTab
					spaceName={ name.trim() || translate( 'this space' ) }
					onDelete={ () => setIsConfirmingDelete( true ) }
				/>
			);
		}
		return (
			<IdentityTab
				name={ name }
				onNameChange={ setName }
				nameError={ nameError }
				tags={ tags }
				onTagsChange={ setTags }
				languages={ languages }
				onLanguagesChange={ setLanguages }
				color={ color }
				onColorChange={ setColor }
				iconColor={ iconColor }
				onIconColorChange={ setIconColor }
				icon={ icon }
				onIconChange={ setIcon }
			/>
		);
	};

	const sourceCount = selectedSources.length;
	const footerSummary = [
		getLayoutPresetTitle( view, translate ),
		translate( '%(count)d source', '%(count)d sources', {
			count: sourceCount,
			args: { count: sourceCount },
		} ),
	].join( ' · ' );

	const modalTitle = isCreate ? translate( 'Create a new space' ) : translate( 'Customize space' );

	return (
		<Modal
			size="large"
			onRequestClose={ onClose }
			className="customize-space-modal"
			__experimentalHideHeader
			// No `title` (the built-in header is hidden); label the dialog from our
			// own visible heading so the dialog still has an accessible name.
			aria={ { labelledby: SPACE_MODAL_HEADING_ID } }
		>
			<VStack className="customize-space-modal__header" spacing={ 0 }>
				<HStack>
					<h1 id={ SPACE_MODAL_HEADING_ID } className="customize-space-modal__header-heading">
						{ modalTitle }
					</h1>
					<Button
						icon={ <Icon icon={ close } /> }
						label={ translate( 'Close' ) }
						onClick={ onClose }
					/>
				</HStack>
				<p className="customize-space-modal__subtitle">
					{ isCreate
						? translate( 'Set up a space for the feeds and tags you want to read together.' )
						: translate( "Update this space's identity, layout and sources." ) }
				</p>
			</VStack>

			<TabPanel className="customize-space-modal__tabs" initialTabName={ initialTab } tabs={ tabs }>
				{ ( tab ) => (
					<div className="customize-space-modal__panel">
						{ renderTab( tab.name as CustomizeTab ) }
					</div>
				) }
			</TabPanel>

			{ createSpace.isError || updateSpace.isError ? (
				<p className="customize-space-modal__error" role="alert">
					{ getSpaceErrorMessage( isCreate ? createSpace.error : updateSpace.error, translate ) }
				</p>
			) : null }

			<HStack className="customize-space-modal__footer" justify="space-between" alignment="center">
				<HStack
					className="customize-space-modal__footer-space"
					spacing={ 2 }
					justify="flex-start"
					expanded={ false }
				>
					<span
						className={ `customize-space-modal__footer-icon customize-space-modal__footer-icon--${ iconColor }` }
						aria-hidden="true"
					>
						<Icon icon={ SPACE_ICONS[ icon ] } size={ 18 } />
					</span>
					<VStack spacing={ 0 } className="customize-space-modal__footer-text">
						<span className="customize-space-modal__footer-name">
							{ name.trim() || translate( 'New space' ) }
						</span>
						<span className="customize-space-modal__footer-summary">{ footerSummary }</span>
					</VStack>
				</HStack>
				<HStack spacing={ 2 } justify="flex-end" expanded={ false }>
					<Button
						__next40pxDefaultSize
						variant="tertiary"
						disabled={ isPending }
						onClick={ onClose }
					>
						{ translate( 'Cancel' ) }
					</Button>
					<Button
						__next40pxDefaultSize
						variant="primary"
						isBusy={ isPending }
						disabled={ ! isSeeded || !! nameError || isPending }
						onClick={ handleSave }
					>
						{ isCreate ? translate( 'Create' ) : translate( 'Save changes' ) }
					</Button>
				</HStack>
			</HStack>

			{ isConfirmingDelete ? (
				<ConfirmDeleteDialog
					spaceName={ space?.name ?? name }
					isDeleting={ deleteSpace.isPending }
					onConfirm={ handleConfirmDelete }
					onCancel={ () => setIsConfirmingDelete( false ) }
				/>
			) : null }
		</Modal>
	);
}
