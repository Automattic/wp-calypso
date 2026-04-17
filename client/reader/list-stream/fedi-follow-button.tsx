import { Button, Modal, TextControl, __experimentalHStack as HStack } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useRef, useState } from 'react';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import SplitButton from 'calypso/components/split-button';
import { useFediConnectionContext } from 'calypso/lib/fediverse';
import { publicListItemsToFediAccounts } from './fedi-account-mapper';
import type { PublicListItem } from './use-public-list-query';

interface FediFollowAllButtonProps {
	items: PublicListItem[];
	listSlug: string;
}

export function FediFollowAllButton( { items, listSlug }: FediFollowAllButtonProps ) {
	const translate = useTranslate();
	const [ connectionState, actions ] = useFediConnectionContext();
	const [ showModal, setShowModal ] = useState( false );
	const [ instanceDomain, setInstanceDomain ] = useState( '' );
	const pendingFollowTriggered = useRef( false );

	const fediAccounts = publicListItemsToFediAccounts( items );

	const {
		instance: connectedInstance,
		isAuthenticating,
		isFollowing,
		followResults,
		followProgress,
		pendingAction,
	} = connectionState;

	// After OAuth redirect, automatically run the pending follow-all.
	useEffect( () => {
		if (
			pendingAction === 'follow-all' &&
			connectedInstance &&
			! isFollowing &&
			! pendingFollowTriggered.current
		) {
			pendingFollowTriggered.current = true;
			actions.followAll( connectedInstance, listSlug, fediAccounts );
		}
	}, [ pendingAction, connectedInstance, isFollowing, listSlug, fediAccounts, actions ] );

	if ( fediAccounts.length === 0 ) {
		return null;
	}

	const handleFollowAll = () => {
		if ( connectedInstance ) {
			actions.followAll( connectedInstance, listSlug, fediAccounts );
			return;
		}
		setShowModal( true );
	};

	const handleConnect = () => {
		if ( instanceDomain.trim() ) {
			setShowModal( false );
			actions.followAll( instanceDomain.trim(), listSlug, fediAccounts );
		}
	};

	const handleChangeInstance = () => {
		actions.disconnect();
		setInstanceDomain( '' );
		setShowModal( true );
	};

	const succeeded = followResults.filter( ( r ) => r.success ).length;
	const failed = followResults.filter( ( r ) => ! r.success ).length;

	let label;
	if ( isAuthenticating ) {
		label = '\u2042 ' + translate( 'Connecting\u2026' );
	} else if ( isFollowing ) {
		label =
			'\u2042 ' +
			translate( 'Following\u2026 (%(done)d/%(total)d)', {
				args: { done: followProgress[ 0 ], total: followProgress[ 1 ] },
			} );
	} else if ( succeeded > 0 ) {
		label =
			'\u2042 ' +
			translate( '%(count)d followed', '%(count)d followed', {
				count: succeeded,
				args: { count: succeeded },
			} );
		if ( failed > 0 ) {
			label =
				'\u2042 ' +
				translate(
					'%(succeeded)d followed, %(failed)d failed',
					'%(succeeded)d followed, %(failed)d failed',
					{
						count: failed,
						args: { succeeded, failed },
					}
				);
		}
	} else {
		label = '\u2042 ' + translate( 'Social Web' );
	}

	const modal = showModal && (
		<Modal
			title={ translate( 'Connect your Fediverse instance' ) }
			onRequestClose={ () => setShowModal( false ) }
		>
			<p>
				{ translate(
					'Enter your Mastodon or Fediverse instance to follow %(count)d account.',
					'Enter your Mastodon or Fediverse instance to follow %(count)d accounts.',
					{
						count: fediAccounts.length,
						args: { count: fediAccounts.length },
					}
				) }
			</p>
			<TextControl
				label={ translate( 'Instance domain' ) }
				placeholder="mastodon.social"
				value={ instanceDomain }
				onChange={ setInstanceDomain }
				onKeyDown={ ( e: React.KeyboardEvent ) => {
					if ( e.key === 'Enter' ) {
						handleConnect();
					}
				} }
			/>
			<HStack justify="flex-end" spacing={ 2 } style={ { marginTop: '16px' } }>
				<Button variant="tertiary" onClick={ () => setShowModal( false ) }>
					{ translate( 'Cancel' ) }
				</Button>
				<Button variant="primary" onClick={ handleConnect } disabled={ ! instanceDomain.trim() }>
					{ translate( 'Connect & Follow' ) }
				</Button>
			</HStack>
		</Modal>
	);

	// After connecting, show a SplitButton with disconnect/change option.
	if ( connectedInstance ) {
		return (
			<>
				<SplitButton
					label={ label }
					onClick={ handleFollowAll }
					disabled={ isFollowing || isAuthenticating }
				>
					<PopoverMenuItem onClick={ handleChangeInstance }>
						{ translate( 'Change instance (%s)', { args: connectedInstance } ) }
					</PopoverMenuItem>
					<PopoverMenuItem onClick={ actions.disconnect }>
						{ translate( 'Disconnect' ) }
					</PopoverMenuItem>
				</SplitButton>
				{ modal }
			</>
		);
	}

	return (
		<>
			<Button
				variant="secondary"
				onClick={ handleFollowAll }
				disabled={ isFollowing || isAuthenticating }
			>
				{ label }
			</Button>
			{ modal }
		</>
	);
}
