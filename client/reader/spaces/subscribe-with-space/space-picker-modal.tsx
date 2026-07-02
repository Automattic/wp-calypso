import { getReadSpaceSourceKey, type ReadSpace, type ReadSpaceDetails } from '@automattic/api-core';
import {
	Button,
	Modal,
	SearchControl,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { Icon, check, close, plus, rss } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useMemo, useRef, useState } from 'react';
import { SiteIcon } from 'calypso/blocks/site-icon';
import Skeleton from 'calypso/reader/components/skeleton';
import {
	getFollowingSource,
	useFollowSite,
	useIsSubscribedStatus,
	useSiteSubscriptionForFeed,
} from 'calypso/reader/data/site-subscriptions';
import { useSpaces, useSpacesDetails, useUpdateSpace } from 'calypso/reader/data/spaces';
import { resolveSpaceIconColor } from 'calypso/reader/spaces/colors';
import { getSpaceErrorMessage } from 'calypso/reader/spaces/form-helpers';
import { SPACE_ICONS } from 'calypso/reader/spaces/icons';
import { useDispatch } from 'calypso/state';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';

import './style.scss';

// Show the search field only once the list is long enough to be worth filtering.
const SEARCH_THRESHOLD = 6;

// Ties the hidden Modal header's accessible name to our custom visible heading.
const SPACE_PICKER_HEADING_ID = 'reader-space-picker__heading';

interface Props {
	feedUrl: string;
	feedId?: number;
	blogId?: number;
	/** Follow source recorded when the picker subscribes the feed on open. */
	followApiSource?: string;
	onClose: () => void;
}

/** Strip the scheme and a leading `www.` so the feed reads as a plain domain. */
function feedHostLabel( feedUrl: string | undefined ): string {
	if ( ! feedUrl ) {
		return '';
	}
	try {
		return new URL( feedUrl ).hostname.replace( /^www\./, '' );
	} catch {
		return feedUrl
			.replace( /^https?:\/\//, '' )
			.replace( /^www\./, '' )
			.replace( /\/.*$/, '' );
	}
}

/**
 * Lets the user choose which of their Spaces this (just-subscribed) feed belongs
 * to. Toggling a Space only edits a local draft; nothing is written until the user
 * hits Save, which then persists each changed Space through its update endpoint
 * (`useUpdateSpace`) with the full replacement feed list. Cancel discards the draft.
 */
export function SpacePickerModal( { feedUrl, feedId, blogId, followApiSource, onClose }: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const spaces = useSpaces();
	const [ query, setQuery ] = useState( '' );
	const [ isSaving, setIsSaving ] = useState( false );

	// Opening the picker subscribes the feed straight away (if it isn't already), so
	// the user only has to pick the Space. Adds stay disabled until it resolves.
	const {
		isSubscribed,
		isError: isSubscriptionError,
		isLoading: isSubscriptionLoading,
	} = useIsSubscribedStatus( { feedUrl, feedId, blogId } );
	const { mutate: followSite, isPending: isSubscribing } = useFollowSite();
	const openedRef = useRef( false );
	useEffect( () => {
		if ( openedRef.current ) {
			return;
		}
		openedRef.current = true;
		dispatch(
			recordReaderTracksEvent( 'calypso_reader_subscribe_space_modal_opened', {
				feed_id: feedId,
				blog_id: blogId,
			} )
		);
		// Runs once when the picker opens.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );
	const followAttemptedRef = useRef( false );
	useEffect( () => {
		if (
			followAttemptedRef.current ||
			isSubscriptionLoading ||
			isSubscriptionError ||
			isSubscribed
		) {
			return;
		}
		followAttemptedRef.current = true;
		followSite( { feedUrl, source: followApiSource ?? getFollowingSource() } );
	}, [
		feedUrl,
		followApiSource,
		followSite,
		isSubscribed,
		isSubscriptionError,
		isSubscriptionLoading,
	] );

	const feedSourceKey = getReadSpaceSourceKey( { feedId, blogId, feedUrl } );
	// Feed identifier the update endpoint accepts (numeric id, falling back to url).
	const feedIdentifier = feedId ?? feedUrl;
	const feedHost = useMemo( () => feedHostLabel( feedUrl ), [ feedUrl ] );
	// The just-subscribed feed's own site icon for the preview row.
	const feedSubscription = useSiteSubscriptionForFeed( feedId );

	const spaceIds = useMemo( () => spaces.map( ( space ) => space.id ), [ spaces ] );
	const { byId, isError, isLoading } = useSpacesDetails( spaceIds );

	// Which spaces already contain the feed, from the server.
	const initialSelected = useMemo( () => {
		const selected = new Set< string >();
		for ( const space of spaces ) {
			const detail = byId[ space.id ];
			if (
				detail?.sources.some( ( source ) => getReadSpaceSourceKey( source ) === feedSourceKey )
			) {
				selected.add( space.id );
			}
		}
		return selected;
	}, [ spaces, byId, feedSourceKey ] );

	// Local draft of the desired membership. `null` until the user edits it, so the
	// list keeps reflecting the server state while the details are still loading.
	const [ draft, setDraft ] = useState< Set< string > | null >( null );
	const selected = draft ?? initialSelected;

	const toggleSpace = ( spaceId: string ) => {
		setDraft( ( previous ) => {
			const next = new Set( previous ?? initialSelected );
			if ( next.has( spaceId ) ) {
				next.delete( spaceId );
			} else {
				next.add( spaceId );
			}
			return next;
		} );
	};

	const toAdd = [ ...selected ].filter( ( id ) => ! initialSelected.has( id ) );
	const toRemove = [ ...initialSelected ].filter( ( id ) => ! selected.has( id ) );
	const hasChanges = toAdd.length > 0 || toRemove.length > 0;
	const changedSpaceIds = [ ...toAdd, ...toRemove ];
	const hasMissingChangedDetails = changedSpaceIds.some( ( id ) => ! byId[ id ] );

	const { mutateAsync: updateSpace } = useUpdateSpace();

	// A space is edited through its update endpoint with the full replacement feed
	// list, so build it from the space's current sources (minus this feed) and add
	// the feed back only when it should be a member.
	const buildFeeds = ( spaceId: string, shouldInclude: boolean ): ( number | string )[] => {
		const others = ( byId[ spaceId ]?.sources ?? [] )
			.filter( ( source ) => getReadSpaceSourceKey( source ) !== feedSourceKey )
			.map( ( source ) => source.feedId ?? source.feedUrl );
		return shouldInclude ? [ ...others, feedIdentifier ] : others;
	};

	const handleSave = async () => {
		if ( ! hasChanges ) {
			onClose();
			return;
		}
		if ( isError || hasMissingChangedDetails ) {
			return;
		}

		setIsSaving( true );
		try {
			await Promise.all( [
				...toAdd.map( ( spaceId ) =>
					updateSpace( { spaceId, params: { feeds: buildFeeds( spaceId, true ) } } )
				),
				...toRemove.map( ( spaceId ) =>
					updateSpace( { spaceId, params: { feeds: buildFeeds( spaceId, false ) } } )
				),
			] );
			dispatch(
				recordReaderTracksEvent( 'calypso_reader_subscribe_space_saved', {
					feed_id: feedId,
					added: toAdd.length,
					removed: toRemove.length,
				} )
			);
			dispatch( successNotice( translate( 'Spaces updated.' ), { duration: 5000 } ) );
			onClose();
		} catch ( error ) {
			setIsSaving( false );
			dispatch( errorNotice( getSpaceErrorMessage( error, translate ), { duration: 5000 } ) );
		}
	};

	const showSearch = spaces.length > SEARCH_THRESHOLD;
	const filteredSpaces = useMemo( () => {
		const q = query.trim().toLowerCase();
		if ( ! q ) {
			return spaces;
		}
		return spaces.filter( ( space ) => space.name.toLowerCase().includes( q ) );
	}, [ spaces, query ] );

	// The picker subscribes the feed on open, so keep space edits disabled until the
	// feed is actually subscribed. `! isSubscribed` covers the whole window: before
	// the follow fires, while the subscription check or the follow is in flight, and
	// after a follow that failed and rolled back the optimistic subscription.
	const isSubscriptionNotReady = isSubscriptionLoading || isSubscribing || ! isSubscribed;
	const rowsDisabled = isSubscriptionNotReady || isLoading || isError || isSaving;

	let spacesContent;
	if ( spaces.length === 0 ) {
		spacesContent = (
			<p className="reader-space-picker__empty">
				{ translate( 'You don’t have any spaces yet.' ) }
			</p>
		);
	} else if ( isLoading ) {
		spacesContent = (
			<SpacePickerSkeleton
				count={ Math.min( spaces.length, 6 ) }
				label={ translate( 'Loading your spaces' ) as string }
			/>
		);
	} else {
		spacesContent = (
			<>
				{ showSearch && (
					<SearchControl
						__nextHasNoMarginBottom
						className="reader-space-picker__search"
						value={ query }
						onChange={ setQuery }
						placeholder={ translate( 'Search your spaces…' ) }
					/>
				) }
				{ filteredSpaces.length === 0 ? (
					<p className="reader-space-picker__empty">
						{ translate( 'No spaces match “%(query)s”.', { args: { query } } ) }
					</p>
				) : (
					<VStack spacing={ 1 } role="list" className="reader-space-picker__list">
						{ filteredSpaces.map( ( space ) => (
							<SpacePickerRow
								key={ space.id }
								space={ space }
								detail={ byId[ space.id ] }
								isSelected={ selected.has( space.id ) }
								disabled={ rowsDisabled }
								onToggle={ () => toggleSpace( space.id ) }
							/>
						) ) }
					</VStack>
				) }
			</>
		);
	}

	return (
		// The Modal renders through a portal, but React events still bubble up the
		// component tree. This picker can be opened from inside a clickable post card,
		// so stop clicks here to keep Cancel/close from also triggering the card's
		// navigation to the feed.
		// eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
		<div onClick={ ( event ) => event.stopPropagation() }>
			<Modal
				onRequestClose={ onClose }
				className="reader-space-picker"
				__experimentalHideHeader
				// No `title` (the built-in header is hidden); label the dialog from our
				// own visible heading so the dialog still has an accessible name.
				aria={ { labelledby: SPACE_PICKER_HEADING_ID } }
			>
				<VStack className="reader-space-picker__header" spacing={ 0 }>
					<HStack>
						<h1 id={ SPACE_PICKER_HEADING_ID } className="reader-space-picker__header-heading">
							{ translate( 'Move site to a space' ) }
						</h1>
						<Button
							icon={ <Icon icon={ close } /> }
							label={ translate( 'Close' ) }
							onClick={ onClose }
						/>
					</HStack>
					<p className="reader-space-picker__subtitle">
						{ translate( 'Adds the whole site to a space, not just this post.' ) }
					</p>
				</VStack>

				{ /* What you're adding — the feed you just subscribed to. */ }
				<HStack
					spacing={ 3 }
					alignment="center"
					justify="flex-start"
					className="reader-space-picker__feed"
				>
					<SiteIcon iconUrl={ feedSubscription?.site_icon } siteId={ blogId } size={ 24 } />
					<span className="reader-space-picker__feed-text">
						<span className="reader-space-picker__feed-label">{ translate( 'Site' ) }</span>
						<span className="reader-space-picker__feed-host">{ feedHost }</span>
					</span>
				</HStack>

				{ spacesContent }

				<HStack className="reader-space-picker__footer" justify="flex-end" spacing={ 2 }>
					<Button
						__next40pxDefaultSize
						variant="tertiary"
						disabled={ isSaving }
						onClick={ onClose }
					>
						{ translate( 'Cancel' ) }
					</Button>
					<Button
						__next40pxDefaultSize
						variant="primary"
						isBusy={ isSaving }
						disabled={
							isSubscriptionNotReady ||
							isLoading ||
							isError ||
							isSaving ||
							hasMissingChangedDetails ||
							! hasChanges
						}
						onClick={ handleSave }
					>
						{ translate( 'Save' ) }
					</Button>
				</HStack>
			</Modal>
		</div>
	);
}

interface RowProps {
	space: ReadSpace;
	detail: ReadSpaceDetails | undefined;
	isSelected: boolean;
	disabled: boolean;
	onToggle: () => void;
}

function SpacePickerRow( { space, detail, isSelected, disabled, onToggle }: RowProps ) {
	const translate = useTranslate();
	const icon = SPACE_ICONS[ space.layout.icon ] ?? rss;
	const accentColor = resolveSpaceIconColor( space.layout );

	// `detail` already carries the source list, so the count is free.
	const sourceCount = detail?.sources.length ?? 0;
	let metaLabel = '';
	if ( detail ) {
		metaLabel =
			sourceCount === 0
				? translate( 'No feeds yet' )
				: ( translate( '%(count)d feed', '%(count)d feeds', {
						count: sourceCount,
						args: { count: sourceCount },
				  } ) as string );
	}

	return (
		<HStack
			spacing={ 3 }
			alignment="center"
			justify="space-between"
			role="listitem"
			aria-label={ space.name }
			className={ clsx( 'reader-space-picker__row', `reader-space-picker__row--${ accentColor }`, {
				'is-added': isSelected,
			} ) }
		>
			<HStack
				spacing={ 3 }
				alignment="center"
				justify="flex-start"
				className="reader-space-picker__info"
			>
				<span className="reader-space-picker__icon" aria-hidden="true">
					<Icon icon={ icon } size={ 22 } />
				</span>
				<span className="reader-space-picker__text">
					<span className="reader-space-picker__name">{ space.name }</span>
					{ metaLabel && <span className="reader-space-picker__meta">{ metaLabel }</span> }
				</span>
			</HStack>
			<Button
				__next40pxDefaultSize
				variant={ isSelected ? 'secondary' : 'primary' }
				icon={ isSelected ? check : plus }
				disabled={ disabled }
				aria-label={
					isSelected
						? ( translate( 'Remove from %(name)s', { args: { name: space.name } } ) as string )
						: ( translate( 'Add to %(name)s', { args: { name: space.name } } ) as string )
				}
				onClick={ onToggle }
			/>
		</HStack>
	);
}

function SpacePickerSkeleton( { count, label }: { count: number; label: string } ) {
	return (
		<VStack
			spacing={ 1 }
			className="reader-space-picker__list"
			role="status"
			aria-label={ label }
			aria-live="polite"
		>
			{ Array.from( { length: count }, ( _value, index ) => (
				<HStack
					key={ index }
					spacing={ 3 }
					alignment="center"
					justify="space-between"
					className="reader-space-picker__row"
				>
					<HStack spacing={ 3 } alignment="center" justify="flex-start">
						<Skeleton shape="circle" width="40px" height="40px" />
						<VStack spacing={ 2 }>
							<Skeleton width="140px" height="16px" />
							<Skeleton width="72px" height="12px" />
						</VStack>
					</HStack>
					<Skeleton width="40px" height="40px" />
				</HStack>
			) ) }
		</VStack>
	);
}
