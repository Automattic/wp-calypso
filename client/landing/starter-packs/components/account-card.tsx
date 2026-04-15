import { Button } from '@wordpress/components';
import { check, people } from '@wordpress/icons';
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getAccountUrl } from '../data/packs';
import Avatar from './avatar';
import { useFediConnectionContext } from './fedi-connection-context';
import type { FediAccount } from '../data/packs';

interface AccountCardProps {
	account: FediAccount;
}

function InstanceInput( props: React.InputHTMLAttributes< HTMLInputElement > ) {
	const ref = useRef< HTMLInputElement >( null );
	useEffect( () => {
		ref.current?.focus();
	}, [] );
	return <input ref={ ref } { ...props } />;
}

export default function AccountCard( { account }: AccountCardProps ) {
	const { slug = '' } = useParams< { slug: string } >();
	const [ connectionState, actions ] = useFediConnectionContext();
	const [ showInstanceInput, setShowInstanceInput ] = useState( false );
	const [ instanceDomain, setInstanceDomain ] = useState( '' );
	const accountUrl = getAccountUrl( account );

	const handle = `${ account.username }@${ account.instance }`;
	const isFollowed = connectionState.followResults.some(
		( r ) =>
			r.success &&
			r.account.username === account.username &&
			r.account.instance === account.instance
	);

	const handleFollow = () => {
		if ( isFollowed ) {
			return;
		}

		if ( connectionState.instance ) {
			actions.followOne( connectionState.instance, slug, account );
			return;
		}

		if ( ! showInstanceInput ) {
			setShowInstanceInput( true );
			return;
		}

		if ( instanceDomain.trim() ) {
			actions.followOne( instanceDomain.trim(), slug, account );
			setShowInstanceInput( false );
			setInstanceDomain( '' );
		}
	};

	const handleKeyDown = ( e: React.KeyboardEvent ) => {
		if ( e.key === 'Enter' ) {
			handleFollow();
		}
		if ( e.key === 'Escape' ) {
			setShowInstanceInput( false );
			setInstanceDomain( '' );
		}
	};

	return (
		<div className="account-card">
			<a
				href={ accountUrl }
				target="_blank"
				rel="noopener noreferrer"
				className="account-card__profile-link"
			>
				<Avatar src={ account.avatarUrl } alt={ account.displayName } size={ 48 } />
			</a>
			<div className="account-card__info">
				<a
					href={ accountUrl }
					target="_blank"
					rel="noopener noreferrer"
					className="account-card__name-link"
				>
					<strong className="account-card__display-name">{ account.displayName }</strong>
					<span className="account-card__handle">@{ handle }</span>
				</a>
				<p className="account-card__bio">{ account.bio }</p>
			</div>
			<div className="account-card__actions">
				{ ! connectionState.instance && showInstanceInput && (
					<InstanceInput
						type="text"
						className="account-card__instance-input"
						placeholder="your.instance"
						value={ instanceDomain }
						onChange={ ( e ) => setInstanceDomain( e.target.value ) }
						onKeyDown={ handleKeyDown }
					/>
				) }
				<Button
					variant={ isFollowed ? 'tertiary' : 'secondary' }
					icon={ isFollowed ? check : people }
					size="compact"
					onClick={ handleFollow }
					disabled={ isFollowed || connectionState.isFollowing }
				>
					{ isFollowed ? 'Following' : 'Follow' }
				</Button>
			</div>
		</div>
	);
}
