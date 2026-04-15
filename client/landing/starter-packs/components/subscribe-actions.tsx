import { Button, Spinner } from '@wordpress/components';
import {
	Icon,
	check,
	closeSmall,
	cautionFilled,
	download,
	external,
	people,
} from '@wordpress/icons';
import { useEffect, useRef, useState } from 'react';
import { getPackBySlug } from '../data/packs';
import useReaderFollow from '../hooks/use-reader-follow';
import { getAuthState } from '../lib/fedi-auth';
import { useFediConnectionContext } from './fedi-connection-context';
import { downloadOpml } from './opml-generator';
import { useWpcomUser } from './wpcom-user-context';
import type { StarterPack } from '../data/packs';

interface SubscribeActionsProps {
	pack: StarterPack;
}

function InstanceInput( props: React.InputHTMLAttributes< HTMLInputElement > ) {
	const ref = useRef< HTMLInputElement >( null );
	useEffect( () => {
		ref.current?.focus();
	}, [] );
	return <input ref={ ref } { ...props } />;
}

export default function SubscribeActions( { pack }: SubscribeActionsProps ) {
	const { isLoggedIn } = useWpcomUser();
	const [ connectionState, actions ] = useFediConnectionContext();
	const reader = useReaderFollow();
	const [ showInstanceInput, setShowInstanceInput ] = useState( false );
	const [ instanceDomain, setInstanceDomain ] = useState( '' );
	const pendingFollowTriggered = useRef( false );

	const {
		instance: connectedInstance,
		isAuthenticating,
		isFollowing: isFediFollowing,
		followResults: fediFollowResults,
		followProgress: fediFollowProgress,
		error: fediError,
		pendingAction,
	} = connectionState;

	// After Mastodon OAuth redirect completes, automatically run the pending follow-all.
	useEffect( () => {
		if (
			pendingAction === 'follow-all' &&
			connectedInstance &&
			! isFediFollowing &&
			! pendingFollowTriggered.current
		) {
			pendingFollowTriggered.current = true;
			const authState = getAuthState();
			const targetPack = authState?.packSlug ? getPackBySlug( authState.packSlug ) : pack;
			if ( targetPack ) {
				actions.followAll( connectedInstance, targetPack.slug, targetPack.accounts );
			}
		}
	}, [ pendingAction, connectedInstance, isFediFollowing, pack, actions ] );

	const handleFollowAll = () => {
		if ( connectedInstance ) {
			actions.followAll( connectedInstance, pack.slug, pack.accounts );
			return;
		}

		if ( ! showInstanceInput ) {
			setShowInstanceInput( true );
			return;
		}

		if ( instanceDomain.trim() ) {
			actions.followAll( instanceDomain.trim(), pack.slug, pack.accounts );
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

	const handleReaderSubscribe = () => {
		if ( ! isLoggedIn ) {
			// Redirect to WordPress.com login, then back to this pack page.
			const returnUrl = window.location.pathname;
			window.location.href = `https://wordpress.com/log-in?redirect_to=${ encodeURIComponent(
				returnUrl
			) }`;
			return;
		}
		reader.followAllInReader( pack.accounts );
	};

	const handleOpmlDownload = () => {
		downloadOpml( pack );
	};

	const opmlUrl = `/starter-packs/${ pack.slug }/opml`;

	const fediSucceeded = fediFollowResults.filter( ( r ) => r.success ).length;
	const fediFailed = fediFollowResults.filter( ( r ) => ! r.success ).length;
	const readerSucceeded = reader.followResults.filter( ( r ) => r.success ).length;
	const readerFailed = reader.followResults.filter( ( r ) => ! r.success ).length;
	const isFollowing = isFediFollowing || reader.isFollowing;

	return (
		<>
			<div className="subscribe-actions">
				{ /* Connection status */ }
				{ connectedInstance && (
					<div className="subscribe-actions__status">
						Connected to <strong>{ connectedInstance }</strong>
						<Button
							variant="link"
							size="compact"
							icon={ closeSmall }
							label="Disconnect"
							onClick={ actions.disconnect }
						/>
					</div>
				) }

				{ /* Follow on Mastodon */ }
				<div className="subscribe-actions__row">
					{ ! connectedInstance && showInstanceInput && (
						<InstanceInput
							type="text"
							className="subscribe-actions__instance-input"
							placeholder="mastodon.social"
							value={ instanceDomain }
							onChange={ ( e ) => setInstanceDomain( e.target.value ) }
							onKeyDown={ handleKeyDown }
						/>
					) }
					<Button
						variant="primary"
						icon={ people }
						onClick={ handleFollowAll }
						disabled={ isFollowing || isAuthenticating }
					>
						{ isAuthenticating && 'Connecting\u2026' }
						{ isFediFollowing &&
							`Following\u2026 (${ fediFollowProgress[ 0 ] }/${ fediFollowProgress[ 1 ] })` }
						{ ! isAuthenticating &&
							! isFediFollowing &&
							`Follow all ${ pack.accounts.length } accounts` }
					</Button>
					{ isFediFollowing && <Spinner /> }
				</div>

				{ /* Secondary actions */ }
				<div className="subscribe-actions__row subscribe-actions__row--spread">
					<div className="subscribe-actions__row-start">
						<Button
							variant="secondary"
							icon={ external }
							onClick={ handleReaderSubscribe }
							disabled={ isFollowing }
						>
							{ reader.isFollowing
								? `Subscribing\u2026 (${ reader.followProgress[ 0 ] }/${ reader.followProgress[ 1 ] })`
								: 'WordPress.com Reader' }
						</Button>
						{ reader.isFollowing && <Spinner /> }
					</div>
					<div className="subscribe-actions__row-end">
						<Button variant="secondary" icon={ external } href={ opmlUrl } target="_blank">
							OPML
						</Button>
						<Button variant="secondary" icon={ download } onClick={ handleOpmlDownload }>
							Download OPML
						</Button>
					</div>
				</div>
			</div>
			{ /* Results & errors — below the grey box */ }
			{ ( fediSucceeded > 0 ||
				readerSucceeded > 0 ||
				fediFailed + readerFailed > 0 ||
				fediError ||
				reader.error ) && (
				<div className="subscribe-actions__messages">
					{ fediSucceeded > 0 && (
						<span className="subscribe-actions__message subscribe-actions__message--success">
							<Icon icon={ check } size={ 18 } />
							{ fediSucceeded } followed on Mastodon
						</span>
					) }
					{ readerSucceeded > 0 && (
						<span className="subscribe-actions__message subscribe-actions__message--success">
							<Icon icon={ check } size={ 18 } />
							{ readerSucceeded } subscribed in Reader
						</span>
					) }
					{ fediFailed + readerFailed > 0 && (
						<span className="subscribe-actions__message subscribe-actions__message--error">
							<Icon icon={ cautionFilled } size={ 18 } />
							{ fediFailed + readerFailed } failed
						</span>
					) }
					{ fediError && (
						<span className="subscribe-actions__message subscribe-actions__message--error">
							<Icon icon={ cautionFilled } size={ 18 } />
							{ fediError }
						</span>
					) }
					{ reader.error && (
						<span className="subscribe-actions__message subscribe-actions__message--error">
							<Icon icon={ cautionFilled } size={ 18 } />
							{ reader.error }
						</span>
					) }
				</div>
			) }
		</>
	);
}
