import { Button, Spinner } from '@wordpress/components';
import { Icon, check, cautionFilled, people } from '@wordpress/icons';
import { useEffect, useRef, useState } from 'react';
import { useFediConnectionContext } from 'calypso/lib/fediverse';
import { publicListItemsToFediAccounts } from './fedi-account-mapper';
import type { PublicListItem } from './use-public-list-query';

interface FediFollowAllButtonProps {
	items: PublicListItem[];
	listSlug: string;
}

function InstanceInput( props: React.InputHTMLAttributes< HTMLInputElement > ) {
	const ref = useRef< HTMLInputElement >( null );
	useEffect( () => {
		ref.current?.focus();
	}, [] );
	return <input ref={ ref } { ...props } />;
}

export function FediFollowAllButton( { items, listSlug }: FediFollowAllButtonProps ) {
	const [ connectionState, actions ] = useFediConnectionContext();
	const [ showInstanceInput, setShowInstanceInput ] = useState( false );
	const [ instanceDomain, setInstanceDomain ] = useState( '' );
	const pendingFollowTriggered = useRef( false );

	const fediAccounts = publicListItemsToFediAccounts( items );

	const {
		instance: connectedInstance,
		isAuthenticating,
		isFollowing,
		followResults,
		followProgress,
		error,
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

	// Don't render if no items have fediverse handles.
	if ( fediAccounts.length === 0 ) {
		return null;
	}

	const handleFollowAll = () => {
		if ( connectedInstance ) {
			actions.followAll( connectedInstance, listSlug, fediAccounts );
			return;
		}

		if ( ! showInstanceInput ) {
			setShowInstanceInput( true );
			return;
		}

		if ( instanceDomain.trim() ) {
			actions.followAll( instanceDomain.trim(), listSlug, fediAccounts );
		}
	};

	const handleKeyDown = ( e: React.KeyboardEvent ) => {
		if ( e.key === 'Enter' ) {
			handleFollowAll();
		}
		if ( e.key === 'Escape' ) {
			setShowInstanceInput( false );
			setInstanceDomain( '' );
		}
	};

	const succeeded = followResults.filter( ( r ) => r.success ).length;
	const failed = followResults.filter( ( r ) => ! r.success ).length;

	return (
		<div className="fedi-follow-button">
			{ connectedInstance && (
				<span className="fedi-follow-button__status">
					{ connectedInstance }
					<Button variant="link" size="compact" label="Disconnect" onClick={ actions.disconnect }>
						&times;
					</Button>
				</span>
			) }

			<div className="fedi-follow-button__row">
				{ ! connectedInstance && showInstanceInput && (
					<InstanceInput
						type="text"
						className="fedi-follow-button__instance-input"
						placeholder="mastodon.social"
						value={ instanceDomain }
						onChange={ ( e ) => setInstanceDomain( e.target.value ) }
						onKeyDown={ handleKeyDown }
					/>
				) }
				<Button
					variant="secondary"
					icon={ people }
					onClick={ handleFollowAll }
					disabled={ isFollowing || isAuthenticating }
				>
					{ isAuthenticating && 'Connecting\u2026' }
					{ isFollowing && `Following\u2026 (${ followProgress[ 0 ] }/${ followProgress[ 1 ] })` }
					{ ! isAuthenticating && ! isFollowing && `Follow ${ fediAccounts.length } on Fediverse` }
				</Button>
				{ isFollowing && <Spinner /> }
			</div>

			{ ( succeeded > 0 || failed > 0 || error ) && (
				<div className="fedi-follow-button__results">
					{ succeeded > 0 && (
						<span className="fedi-follow-button__result fedi-follow-button__result--success">
							<Icon icon={ check } size={ 18 } />
							{ succeeded } followed
						</span>
					) }
					{ failed > 0 && (
						<span className="fedi-follow-button__result fedi-follow-button__result--error">
							<Icon icon={ cautionFilled } size={ 18 } />
							{ failed } failed
						</span>
					) }
					{ error && (
						<span className="fedi-follow-button__result fedi-follow-button__result--error">
							<Icon icon={ cautionFilled } size={ 18 } />
							{ error }
						</span>
					) }
				</div>
			) }
		</div>
	);
}
