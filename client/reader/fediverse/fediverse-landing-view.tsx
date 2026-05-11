import './style.scss';

import { useFediverseConnectionsQuery } from '@automattic/api-queries';
import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	Button,
	Card,
	CardBody,
	Spinner,
} from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import EmptyContent from 'calypso/components/empty-content';
import ReaderMain from 'calypso/reader/components/reader-main';
import { TIMELINE_TAB } from './helper';
import { hostFromUrl } from './route';
import type { FediverseConnection } from '@automattic/api-core';

export function FediverseLandingView() {
	const translate = useTranslate();
	const { data, isPending, isError, refetch } = useFediverseConnectionsQuery();

	const connections = data?.connections ?? [];

	return (
		<ReaderMain className="fediverse-view">
			<DocumentHead title={ translate( 'Fediverse ‹ Reader' ) } />
			<VStack spacing={ 6 } className="fediverse-landing">
				<header className="fediverse-landing__header">
					<h1>{ translate( 'Fediverse' ) }</h1>
					<p>
						{ translate( 'Compose and publish to the Fediverse from a WordPress site you own.' ) }
					</p>
				</header>

				{ isPending && (
					<div role="status" aria-live="polite" className="fediverse-landing__loading">
						<Spinner />
						<span className="fediverse-landing__loading-text">
							{ translate( 'Loading your accounts…' ) }
						</span>
					</div>
				) }

				{ isError && (
					<EmptyContent
						title={ translate( 'We couldn’t load your Fediverse accounts.' ) }
						line={ translate( 'Check your connection and try again.' ) }
						action={ translate( 'Try again' ) }
						actionCallback={ () => refetch() }
					/>
				) }

				{ ! isPending && ! isError && connections.length === 0 && (
					<EmptyContent
						title={ translate( 'No Fediverse accounts yet' ) }
						line={ translate(
							'Enable the ActivityPub plugin on a WordPress site you own to see it here.'
						) }
					/>
				) }

				{ ! isPending && ! isError && connections.length > 0 && (
					<VStack
						spacing={ 3 }
						as="ul"
						aria-label={ String( translate( 'Your Fediverse accounts' ) ) }
						className="fediverse-landing__accounts"
					>
						{ connections.map( ( connection ) => (
							<li key={ connection.id }>
								<AccountCard connection={ connection } />
							</li>
						) ) }
					</VStack>
				) }
			</VStack>
		</ReaderMain>
	);
}

function AccountCard( { connection }: { connection: FediverseConnection } ) {
	const translate = useTranslate();
	const href = `/reader/fediverse/${ connection.id }/${ TIMELINE_TAB }`;
	const displayName = connection.name?.trim() || connection.webfinger;
	const siteHost = hostFromUrl( connection.url );
	return (
		<Card size="medium" className="fediverse-landing__account">
			<CardBody>
				<HStack alignment="left" spacing={ 4 }>
					{ connection.icon ? (
						<img
							src={ connection.icon }
							alt=""
							className="fediverse-landing__avatar"
							loading="lazy"
						/>
					) : (
						<span aria-hidden="true" className="fediverse-landing__avatar is-placeholder" />
					) }
					<VStack spacing={ 1 } className="fediverse-landing__account-meta">
						<span className="fediverse-landing__account-name">{ displayName }</span>
						<span className="fediverse-landing__account-handle">{ connection.webfinger }</span>
						{ siteHost && <span className="fediverse-landing__account-host">{ siteHost }</span> }
					</VStack>
					<Button variant="primary" href={ href }>
						{ translate( 'Open' ) }
					</Button>
				</HStack>
			</CardBody>
		</Card>
	);
}

export default FediverseLandingView;
