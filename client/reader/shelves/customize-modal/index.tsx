import {
	getReadShelfSourceKey,
	getSiteSubscriptionSourceKey,
	type ReadShelf,
	type SiteSubscriptionItem,
	type ShelfColor,
	type ShelfFeedLayout,
	type ShelfIcon,
	type ShelfLayoutWidth,
	type ShelfSource,
	type ShelfTextColor,
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
import { StepIndicator } from 'calypso/reader/components/step-indicator';
import {
	useCreateShelf,
	useDeleteShelf,
	useShelfBySlug,
	useShelves,
	useUpdateShelf,
} from 'calypso/reader/data/shelves';
import {
	DEFAULT_SHELF_COLOR,
	DEFAULT_SHELF_TEXT_COLOR,
	resolveShelfIconColor,
} from 'calypso/reader/shelves/colors';
import { getShelfErrorMessage, validateName } from 'calypso/reader/shelves/form-helpers';
import { SHELF_ICONS } from 'calypso/reader/shelves/icons';
import { isKnownLanguageCode, toBaseLanguageCode } from 'calypso/reader/shelves/languages';
import { getShelfTabPath, parseShelfTabFromPath } from 'calypso/reader/shelves/routes';
import { useDispatch, useSelector } from 'calypso/state';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import { successNotice } from 'calypso/state/notices/actions';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import { DEFAULT_SHELF_FEED_LAYOUT } from '../feed/layouts/registry';
import { ConfirmDeleteDialog } from './confirm-delete';
import { DeleteTab } from './delete-tab';
import { IdentityTab } from './identity-tab';
import { DEFAULT_SHELF_WIDTH, getLayoutPresetTitle, LayoutTab } from './layout-tab';
import { SourcesTab } from './sources-tab';
import { TopicsTab } from './topics-tab';

import './style.scss';

export type CustomizeTab = 'identity' | 'layout' | 'sources' | 'topics' | 'delete';

// Ties the hidden Modal header's accessible name to our custom visible heading.
const SHELF_MODAL_HEADING_ID = 'customize-shelf-modal__heading';

interface CustomizeModalProps {
	isOpen: boolean;
	// The shelf's URL slug (edit mode resolves the detail by it, reusing the view's
	// by-slug cache). Null while no shelf is addressed.
	slug: string | null;
	onClose: () => void;
	initialTab?: CustomizeTab;
}

export function CustomizeModal( {
	isOpen,
	slug,
	onClose,
	initialTab = 'identity',
}: CustomizeModalProps ) {
	return (
		<ShelfUpsertModal
			isOpen={ isOpen }
			mode="edit"
			slug={ slug }
			onClose={ onClose }
			initialTab={ initialTab }
		/>
	);
}

type ShelfUpsertMode = 'create' | 'edit';
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

const getShelfSourceDraftItem = ( source: ShelfSource ): SourceDraftItem => ( {
	key: getReadShelfSourceKey( source ),
	feed: source.feedId ?? source.feedUrl,
} );

interface ShelfUpsertModalProps {
	isOpen: boolean;
	mode: ShelfUpsertMode;
	slug?: string | null;
	onClose: () => void;
	onCreated?: ( shelf: ReadShelf ) => void;
	initialTab?: CustomizeTab;
}

export function ShelfUpsertModal( {
	isOpen,
	mode,
	slug = null,
	onClose,
	onCreated,
	initialTab = 'identity',
}: ShelfUpsertModalProps ) {
	// Mount fresh each open so the draft form state resets to the mode's values.
	if ( ! isOpen || ( mode === 'edit' && ! slug ) ) {
		return null;
	}

	return (
		<ShelfUpsertModalContent
			mode={ mode }
			slug={ slug }
			onClose={ onClose }
			onCreated={ onCreated }
			initialTab={ initialTab }
		/>
	);
}

function ShelfUpsertModalContent( {
	mode,
	slug,
	onClose,
	onCreated,
	initialTab,
}: {
	mode: ShelfUpsertMode;
	slug: string | null;
	onClose: () => void;
	onCreated?: ( shelf: ReadShelf ) => void;
	initialTab: CustomizeTab;
} ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const userLocale = useSelector( getCurrentUserLocale );
	// The path we're on, so a rename can redirect to the new slug while preserving
	// the current tab. Only meaningful in edit mode (we're on the shelf's URL).
	const currentRoute = useSelector( getCurrentRoute );
	const isCreate = mode === 'create';
	const shelfQuery = useShelfBySlug( slug, {
		enabled: ! isCreate,
		refetchOnMount: 'always',
	} );
	const shelf = shelfQuery.data;
	const editShelfId = shelf?.id ?? null;
	const shelves = useShelves();
	const createShelf = useCreateShelf();
	const updateShelf = useUpdateShelf();
	const deleteShelf = useDeleteShelf();

	// Draft state is seeded only once from the loaded detail so source mutations
	// cannot clobber unsaved identity/layout edits. Create mode is ready at mount.
	const [ isSeeded, setIsSeeded ] = useState( isCreate );
	const [ name, setName ] = useState( '' );
	const [ tags, setTags ] = useState< string[] >( [] );
	const [ color, setColor ] = useState< ShelfTextColor >( DEFAULT_SHELF_TEXT_COLOR );
	const [ iconColor, setIconColor ] = useState< ShelfColor >( DEFAULT_SHELF_COLOR );
	// New shelves pre-fill the user's account language (as a base code) so Discover
	// is on-language out of the box; edit mode seeds the saved set below.
	const [ languages, setLanguages ] = useState< string[] >( () => {
		if ( ! isCreate || ! userLocale ) {
			return [];
		}
		const base = toBaseLanguageCode( userLocale );
		return isKnownLanguageCode( base ) ? [ base ] : [];
	} );
	const [ icon, setIcon ] = useState< ShelfIcon >( 'inbox' );
	// New shelves default to the classic Reader stream layout; edit mode seeds the
	// shelf's saved layout below.
	const [ view, setView ] = useState< ShelfFeedLayout >(
		isCreate ? 'legacy' : DEFAULT_SHELF_FEED_LAYOUT
	);
	const [ width, setWidth ] = useState< ShelfLayoutWidth >( DEFAULT_SHELF_WIDTH );
	const [ selectedSources, setSelectedSources ] = useState< SourceDraftItem[] >( [] );
	const [ isConfirmingDelete, setIsConfirmingDelete ] = useState( false );
	// Create is a guided wizard that walks through the sections one step at a time;
	// edit keeps the tabbed layout so any section is reachable directly.
	const [ step, setStep ] = useState( 0 );

	// Seed once the open-time refetch has settled, not from the cache it returns
	// immediately — a stale snapshot can omit tags and would lock in empty fields.
	useEffect( () => {
		if (
			! isCreate &&
			shelf &&
			shelfQuery.isSuccess &&
			shelfQuery.isFetchedAfterMount &&
			! isSeeded
		) {
			setName( shelf.name );
			setTags( shelf.tags );
			// `?? []` guards a persisted React Query cache written before `languages`
			// shipped — the adapter always provides an array for fresh responses.
			setLanguages( shelf.languages ?? [] );
			setColor( shelf.layout.color );
			setIconColor( resolveShelfIconColor( shelf.layout ) );
			setIcon( shelf.layout.icon );
			setView( shelf.layout.view ?? DEFAULT_SHELF_FEED_LAYOUT );
			setWidth( shelf.layout.width ?? DEFAULT_SHELF_WIDTH );
			setSelectedSources( shelf.sources.map( getShelfSourceDraftItem ) );
			setIsSeeded( true );
		}
	}, [ isCreate, isSeeded, shelf, shelfQuery.isFetchedAfterMount, shelfQuery.isSuccess ] );

	const existingNames = useMemo(
		() =>
			shelves
				.filter( ( item ) => isCreate || item.id !== editShelfId )
				.map( ( item ) => item.name ),
		[ editShelfId, isCreate, shelves ]
	);
	const nameError = validateName( name, existingNames, translate );
	const isPending = isCreate ? createShelf.isPending : updateShelf.isPending;
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
			createShelf.mutate(
				{
					name: name.trim(),
					tags,
					languages,
					layout: { color, iconColor, icon, view, width },
					feeds: selectedFeeds,
				},
				{
					onSuccess: ( createdShelf ) => {
						dispatch(
							recordReaderTracksEvent( 'calypso_reader_shelves_shelf_created', {
								tag_count: createdShelf.tags.length,
								language_count: createdShelf.languages.length,
								source_count: selectedFeeds.length,
								layout: view,
								icon,
								color,
								icon_color: iconColor,
							} )
						);
						dispatch(
							successNotice(
								translate( '%(name)s created.', { args: { name: createdShelf.name } } ),
								{ duration: 5000 }
							)
						);
						onCreated?.( createdShelf );
						onClose();
					},
				}
			);
			return;
		}

		if ( ! shelf || ! editShelfId ) {
			return;
		}

		updateShelf.mutate(
			{
				shelfId: editShelfId,
				params: {
					name: name.trim(),
					tags,
					languages,
					feeds: selectedFeeds,
					layout: { color, iconColor, icon, view, width },
				},
			},
			{
				onSuccess: ( updatedShelf ) => {
					const previousView = shelf.layout.view ?? DEFAULT_SHELF_FEED_LAYOUT;
					if ( view !== previousView ) {
						dispatch(
							recordReaderTracksEvent( 'calypso_reader_shelves_layout_changed', { layout: view } )
						);
					}
					dispatch(
						recordReaderTracksEvent( 'calypso_reader_shelves_shelf_updated', {
							tag_count: tags.length,
							language_count: languages.length,
							source_count: selectedFeeds.length,
							layout: view,
						} )
					);
					dispatch( successNotice( translate( 'Changes saved.' ), { duration: 5000 } ) );
					onClose();
					// The slug re-syncs to the (possibly renamed) title server-side, so if it
					// changed, the URL we're on now points at the old slug — canonicalize it,
					// keeping the tab we were viewing. The mutation seeded the new slug's cache,
					// so this lands without a refetch flash.
					if ( updatedShelf.slug !== shelf.slug ) {
						page.replace(
							getShelfTabPath( updatedShelf.slug, parseShelfTabFromPath( currentRoute ) )
						);
					}
				},
			}
		);
	};

	const handleConfirmDelete = () => {
		if ( ! editShelfId || deleteShelf.isPending ) {
			return;
		}
		deleteShelf.mutate( editShelfId, {
			onSuccess: () => {
				dispatch( recordReaderTracksEvent( 'calypso_reader_shelves_shelf_deleted' ) );
				dispatch(
					successNotice(
						translate( '%(name)s deleted.', { args: { name: shelf?.name ?? name } } ),
						{ duration: 5000 }
					)
				);
				onClose();
				// We are viewing the now-deleted shelf, so send the user back to the Reader.
				page( '/reader' );
			},
		} );
	};

	const baseTabs: ModalTab[] = [
		{ name: 'identity', title: translate( 'Identity' ) as string },
		{ name: 'layout', title: translate( 'Layout' ) as string },
		{ name: 'sources', title: translate( 'Feeds' ) as string },
		{ name: 'topics', title: translate( 'Topics' ) as string },
	];
	const tabs: ModalTab[] = isCreate
		? baseTabs
		: [ ...baseTabs, { name: 'delete', title: translate( 'Delete' ) as string } ];

	const renderTab = ( tabName: CustomizeTab ) => {
		if ( ! isSeeded ) {
			return (
				<p className="customize-shelf-modal__loading" role="status">
					{ translate( 'Loading…' ) }
				</p>
			);
		}
		if ( tabName === 'layout' ) {
			return (
				<LayoutTab value={ view } onChange={ setView } width={ width } onWidthChange={ setWidth } />
			);
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
		if ( tabName === 'topics' ) {
			return (
				<TopicsTab
					tags={ tags }
					onTagsChange={ setTags }
					languages={ languages }
					onLanguagesChange={ setLanguages }
				/>
			);
		}
		if ( tabName === 'delete' && ! isCreate ) {
			return (
				<DeleteTab
					shelfName={ name.trim() || translate( 'this shelf' ) }
					onDelete={ () => setIsConfirmingDelete( true ) }
				/>
			);
		}
		return (
			<IdentityTab
				name={ name }
				onNameChange={ setName }
				nameError={ nameError }
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
		translate( '%(count)d feed', '%(count)d feeds', {
			count: sourceCount,
			args: { count: sourceCount },
		} ),
	].join( ' · ' );

	// The create wizard walks the base sections in order; the current step maps to
	// the matching entry in `baseTabs` for its heading.
	const wizardSteps = baseTabs;
	const isLastStep = step === wizardSteps.length - 1;
	const currentStep = wizardSteps[ step ];

	const goBack = () => setStep( ( current ) => Math.max( current - 1, 0 ) );
	const goNext = () => {
		if ( isLastStep ) {
			handleSave();
			return;
		}
		setStep( ( current ) => Math.min( current + 1, wizardSteps.length - 1 ) );
	};

	const modalTitle = isCreate ? translate( 'Create a new shelf' ) : translate( 'Customize shelf' );

	return (
		<Modal
			size="large"
			onRequestClose={ onClose }
			className="customize-shelf-modal"
			__experimentalHideHeader
			// No `title` (the built-in header is hidden); label the dialog from our
			// own visible heading so the dialog still has an accessible name.
			aria={ { labelledby: SHELF_MODAL_HEADING_ID } }
		>
			<VStack className="customize-shelf-modal__header" spacing={ 0 }>
				<HStack>
					<h1 id={ SHELF_MODAL_HEADING_ID } className="customize-shelf-modal__header-heading">
						{ modalTitle }
					</h1>
					<Button
						icon={ <Icon icon={ close } /> }
						label={ translate( 'Close' ) }
						onClick={ onClose }
					/>
				</HStack>
				<p className="customize-shelf-modal__subtitle">
					{ isCreate
						? translate( 'Set up a shelf for the feeds and tags you want to read together.' )
						: translate( "Update this shelf's identity, layout and feeds." ) }
				</p>
			</VStack>

			{ isCreate ? (
				<div className="customize-shelf-modal__step">
					<h2 className="customize-shelf-modal__step-heading">{ currentStep.title }</h2>
					<div className="customize-shelf-modal__panel">{ renderTab( currentStep.name ) }</div>
				</div>
			) : (
				<TabPanel
					className="customize-shelf-modal__tabs"
					initialTabName={ initialTab }
					tabs={ tabs }
				>
					{ ( tab ) => (
						<div className="customize-shelf-modal__panel">
							{ renderTab( tab.name as CustomizeTab ) }
						</div>
					) }
				</TabPanel>
			) }

			{ createShelf.isError || updateShelf.isError ? (
				<p className="customize-shelf-modal__error" role="alert">
					{ getShelfErrorMessage( isCreate ? createShelf.error : updateShelf.error, translate ) }
				</p>
			) : null }

			{ isCreate ? (
				<HStack
					className="customize-shelf-modal__footer"
					justify="space-between"
					alignment="center"
				>
					<StepIndicator totalSteps={ wizardSteps.length } currentStep={ step + 1 } />
					<HStack spacing={ 2 } justify="flex-end" expanded={ false }>
						<Button
							__next40pxDefaultSize
							variant="tertiary"
							disabled={ isPending }
							onClick={ step === 0 ? onClose : goBack }
						>
							{ step === 0 ? translate( 'Cancel' ) : translate( 'Back' ) }
						</Button>
						<Button
							__next40pxDefaultSize
							variant="primary"
							isBusy={ isPending }
							disabled={ !! nameError || isPending }
							onClick={ goNext }
						>
							{ isLastStep ? translate( 'Create' ) : translate( 'Next' ) }
						</Button>
					</HStack>
				</HStack>
			) : (
				<HStack
					className="customize-shelf-modal__footer"
					justify="space-between"
					alignment="center"
				>
					<HStack
						className="customize-shelf-modal__footer-shelf"
						spacing={ 2 }
						justify="flex-start"
						expanded={ false }
					>
						<span
							className={ `customize-shelf-modal__footer-icon customize-shelf-modal__footer-icon--${ iconColor }` }
							aria-hidden="true"
						>
							<Icon icon={ SHELF_ICONS[ icon ] } size={ 18 } />
						</span>
						<VStack spacing={ 0 } className="customize-shelf-modal__footer-text">
							<span className="customize-shelf-modal__footer-name">
								{ name.trim() || translate( 'New shelf' ) }
							</span>
							<span className="customize-shelf-modal__footer-summary">{ footerSummary }</span>
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
							{ translate( 'Save changes' ) }
						</Button>
					</HStack>
				</HStack>
			) }

			{ isConfirmingDelete ? (
				<ConfirmDeleteDialog
					shelfName={ shelf?.name ?? name }
					isDeleting={ deleteShelf.isPending }
					onConfirm={ handleConfirmDelete }
					onCancel={ () => setIsConfirmingDelete( false ) }
				/>
			) : null }
		</Modal>
	);
}
