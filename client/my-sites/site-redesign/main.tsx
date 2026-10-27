import page from '@automattic/calypso-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
	Button,
	Notice,
	Spinner,
	__experimentalHeading as Heading,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';
import { useEffect, useRef, useState } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import {
	activateRedesign,
	applyRedesign,
	currentBatch,
	errorCode,
	fetchPreview,
	fetchRedesign,
	generateRedesign,
	getCheckoutUrl,
	openRedesign,
	type Candidate,
	type Redesign,
} from './api';

import './style.scss';

const POLL_MS = 3000;
const POLLED_STATUSES = [ 'generating', 'applying' ];
// About two minutes of waiting for a purchase to reach the site after checkout.
const PURCHASE_POLLS = 40;

type Props = {
	siteId: number;
	siteSlug: string;
	redesignId: string | null;
	resume: boolean;
};

const redesignKey = ( siteId: number, id: string | null ) => [ 'site-redesign', siteId, id ];

const isWaitingForPurchase = ( redesign: Redesign | undefined, resume: boolean ) =>
	resume &&
	redesign?.status === 'preview_ready' &&
	!! redesign.pending_apply &&
	! redesign.eligibility.can_apply;

function httpUrl( url: string | undefined ): string | undefined {
	try {
		return url && [ 'http:', 'https:' ].includes( new URL( url ).protocol ) ? url : undefined;
	} catch {
		return undefined;
	}
}

function messageOf( error: unknown ): string {
	const message = ( error as { message?: unknown } | null )?.message;
	return typeof message === 'string' && message
		? message
		: __( 'Something went wrong. Please try again.' );
}

function applyStepLabel( step: string | undefined ): string {
	switch ( step ) {
		case 'awaiting_atomic':
			return __( 'Preparing your site. This can take a few minutes.' );
		case 'delivering':
			return __( 'Installing your new design…' );
		case 'activating':
			return __( 'Switching your site to the new design…' );
		default:
			return __( 'Getting your new design ready…' );
	}
}

function CandidatePreview( {
	siteId,
	redesignId,
	candidate,
	index,
}: {
	siteId: number;
	redesignId: string;
	candidate: Candidate;
	index: number;
} ) {
	const preview = useQuery( {
		queryKey: [ 'site-redesign-preview', siteId, redesignId, candidate.id ],
		queryFn: () => fetchPreview( siteId, redesignId, candidate.id ),
		staleTime: Infinity,
	} );
	if ( preview.isError ) {
		return <Text>{ messageOf( preview.error ) }</Text>;
	}
	if ( ! preview.data ) {
		return <Spinner />;
	}
	return (
		<iframe
			className="site-redesign__frame"
			title={ sprintf(
				/* translators: %d is the design number, 1 to 4. */
				__( 'Preview of design %d' ),
				index + 1
			) }
			// Opaque origin: the server's own script may run, nothing in it can reach Calypso.
			sandbox="allow-scripts"
			srcDoc={ preview.data.html }
			tabIndex={ -1 }
		/>
	);
}

function CandidateCard( {
	siteId,
	redesignId,
	candidate,
	index,
	canChoose,
	onChoose,
}: {
	siteId: number;
	redesignId: string;
	candidate: Candidate;
	index: number;
	canChoose: boolean;
	onChoose: () => void;
} ) {
	return (
		<VStack className="site-redesign__candidate" spacing={ 3 }>
			<div className="site-redesign__thumbnail">
				{ candidate.status === 'succeeded' && (
					<CandidatePreview
						siteId={ siteId }
						redesignId={ redesignId }
						candidate={ candidate }
						index={ index }
					/>
				) }
				{ ( candidate.status === 'queued' || candidate.status === 'running' ) && <Spinner /> }
				{ candidate.status === 'failed' && (
					<Text>{ candidate.error?.message ?? __( 'This design could not be made.' ) }</Text>
				) }
			</div>
			<Button
				__next40pxDefaultSize
				variant="primary"
				disabled={ ! canChoose || candidate.status !== 'succeeded' }
				onClick={ onChoose }
				aria-label={ sprintf(
					/* translators: %d is the design number, 1 to 4. */
					__( 'Choose design %d' ),
					index + 1
				) }
			>
				{ __( 'Choose this design' ) }
			</Button>
		</VStack>
	);
}

export default function SiteRedesign( { siteId, siteSlug, redesignId, resume }: Props ) {
	const queryClient = useQueryClient();
	const [ notice, setNotice ] = useState< string | null >( null );
	const resumed = useRef( false );
	const started = useRef< string | null >( null );

	const redesignQuery = useQuery( {
		queryKey: redesignKey( siteId, redesignId ),
		queryFn: () => fetchRedesign( siteId, redesignId as string ),
		enabled: !! redesignId,
		staleTime: POLL_MS,
		refetchInterval: ( query ) => {
			const data = query.state.data;
			if ( POLLED_STATUSES.includes( data?.status ?? '' ) ) {
				return POLL_MS;
			}
			return isWaitingForPurchase( data, resume ) && query.state.dataUpdateCount < PURCHASE_POLLS
				? POLL_MS
				: false;
		},
	} );
	const redesign = redesignQuery.data;

	const store = ( next: Redesign ) => {
		queryClient.setQueryData( redesignKey( siteId, next.id ), next );
		if ( next.id !== redesignId ) {
			page.replace( addQueryArgs( `/site-redesign/${ siteSlug }`, { redesign: next.id } ) );
		}
	};

	const noticeHandlers = {
		onMutate: () => setNotice( null ),
		onError: ( error: unknown ) => setNotice( messageOf( error ) ),
	};

	const start = useMutation( {
		mutationFn: async ( retryFailed: boolean ) => {
			const open = redesignId
				? await fetchRedesign( siteId, redesignId )
				: await openRedesign( siteId );
			const needsDesigns =
				( open.status === 'interview' && open.candidates.length === 0 ) ||
				( retryFailed && open.status === 'failed' );
			if ( ! needsDesigns || ! open.eligibility.can_preview ) {
				return open;
			}
			try {
				return await generateRedesign( siteId, open.id );
			} catch ( error ) {
				if ( errorCode( error ) === 'site_redesign_busy' ) {
					return fetchRedesign( siteId, open.id );
				}
				throw error;
			}
		},
		...noticeHandlers,
		onSuccess: store,
	} );

	const { mutate: startDesigns } = start;
	useEffect( () => {
		const key = `${ siteId }:${ redesignId ?? '' }`;
		if (
			! resume &&
			started.current !== key &&
			( ! redesignId ||
				( redesign?.status === 'interview' &&
					redesign.candidates.length === 0 &&
					redesign.eligibility.can_preview ) )
		) {
			started.current = key;
			startDesigns( false );
		}
	}, [ siteId, redesignId, redesign, resume, startDesigns ] );

	const choose = useMutation( {
		mutationFn: ( generationId: string ) =>
			applyRedesign( siteId, redesign?.id as string, generationId ),
		onMutate: noticeHandlers.onMutate,
		onSuccess: store,
		onError: ( error ) => {
			const checkoutUrl = getCheckoutUrl( error );
			if ( checkoutUrl ) {
				page( checkoutUrl );
				return;
			}
			if ( errorCode( error ) === 'site_redesign_busy' ) {
				// Back from checkout, the purchase listener may have started the apply first.
				redesignQuery.refetch();
				return;
			}
			setNotice( messageOf( error ) );
		},
	} );

	const { mutate: chooseCandidate } = choose;

	const activate = useMutation( {
		mutationFn: () => activateRedesign( siteId, redesign?.id as string ),
		...noticeHandlers,
		onSuccess: store,
	} );

	// Back from checkout: the server keeps the choice in `pending_apply` and usually starts the
	// apply on its own after the purchase. Start it here only if it hasn't.
	useEffect( () => {
		if (
			resume &&
			! resumed.current &&
			redesign?.status === 'preview_ready' &&
			redesign.pending_apply &&
			redesign.eligibility.can_apply
		) {
			resumed.current = true;
			chooseCandidate( redesign.pending_apply );
		}
	}, [ resume, redesign, chooseCandidate ] );

	const title = __( 'Redesign your site' );
	const header = (
		<>
			<DocumentHead title={ title } />
			<NavigationHeader
				title={ title }
				subtitle={ __(
					'Pick one of four new designs made from the content already on your site.'
				) }
			/>
		</>
	);

	const retryButton = (
		<Button
			__next40pxDefaultSize
			variant="primary"
			isBusy={ start.isPending }
			disabled={ start.isPending }
			onClick={ () => startDesigns( true ) }
		>
			{ __( 'Retry' ) }
		</Button>
	);
	const opening = (
		<HStack justify="flex-start" role="status">
			<Spinner />
			<Text>{ __( 'Getting your designs ready…' ) }</Text>
		</HStack>
	);

	const renderBody = () => {
		if ( ! redesignId ) {
			return start.isError ? retryButton : opening;
		}
		if ( ! redesign ) {
			return redesignQuery.isError ? (
				<Text>{ messageOf( redesignQuery.error ) }</Text>
			) : (
				<Spinner />
			);
		}

		if ( isWaitingForPurchase( redesign, resume ) ) {
			const polls =
				queryClient.getQueryState( redesignKey( siteId, redesignId ) )?.dataUpdateCount ?? 0;
			return polls < PURCHASE_POLLS ? (
				<HStack justify="flex-start">
					<Spinner />
					<Text>{ __( 'Finishing your purchase…' ) }</Text>
				</HStack>
			) : (
				<Text>
					{ __(
						'Your purchase is taking longer than usual. Reload this page in a few minutes to see your new design.'
					) }
				</Text>
			);
		}

		switch ( redesign.status ) {
			case 'applying':
				return (
					<HStack justify="flex-start">
						<Spinner />
						<Text>{ applyStepLabel( redesign.apply?.status ) }</Text>
					</HStack>
				);
			case 'installed':
				return (
					<VStack alignment="topLeft" spacing={ 4 }>
						<Heading level={ 2 }>{ __( 'Your new design is installed' ) }</Heading>
						<Text>
							{ __(
								'Preview it with your content, then switch to it when you’re ready. Your site keeps its current design until then.'
							) }
						</Text>
						<HStack justify="flex-start">
							<Button
								__next40pxDefaultSize
								variant="secondary"
								href={ httpUrl( redesign.applied?.preview_url ) }
							>
								{ __( 'Preview' ) }
							</Button>
							<Button
								__next40pxDefaultSize
								variant="primary"
								isBusy={ activate.isPending }
								disabled={ activate.isPending }
								onClick={ () => activate.mutate() }
							>
								{ __( 'Use this design' ) }
							</Button>
						</HStack>
					</VStack>
				);
			case 'applied':
				return (
					<VStack alignment="topLeft" spacing={ 4 }>
						<Heading level={ 2 }>{ __( 'Your site has its new design' ) }</Heading>
						<Button
							__next40pxDefaultSize
							variant="primary"
							href={ httpUrl( redesign.applied?.preview_url ) }
						>
							{ __( 'View site' ) }
						</Button>
					</VStack>
				);
			case 'interview':
				if ( ! redesign.eligibility.can_preview ) {
					return <Text>{ __( 'Design previews are not available for this site.' ) }</Text>;
				}
				return start.isError ? retryButton : opening;
			case 'failed':
			case 'rolled_back':
			case 'superseded':
				return (
					<VStack alignment="topLeft" spacing={ 4 }>
						{ redesign.status === 'failed' && (
							<Text>{ __( 'We couldn’t make designs for your site this time.' ) }</Text>
						) }
						{ retryButton }
					</VStack>
				);
		}

		return (
			<VStack spacing={ 4 }>
				{ redesign.status === 'generating' && (
					<HStack justify="flex-start">
						<Spinner />
						<Text>{ __( 'Making four designs from your content…' ) }</Text>
					</HStack>
				) }
				<div className="site-redesign__grid">
					{ currentBatch( redesign ).map( ( candidate, index ) => (
						<CandidateCard
							key={ candidate.id }
							siteId={ siteId }
							redesignId={ redesign.id }
							candidate={ candidate }
							index={ index }
							canChoose={ redesign.status === 'preview_ready' && ! choose.isPending }
							onChoose={ () => chooseCandidate( candidate.id ) }
						/>
					) ) }
				</div>
			</VStack>
		);
	};

	const applyError = redesign?.apply?.error;
	return (
		<Main wideLayout className="site-redesign">
			{ header }
			<VStack spacing={ 4 }>
				{ notice && (
					<Notice status="error" isDismissible={ false }>
						{ notice }
					</Notice>
				) }
				{ applyError && redesign?.status === 'installed' && (
					<Notice status="warning" isDismissible={ false }>
						{ sprintf(
							/* translators: %s is the reason the switch failed. */
							__( 'We couldn’t switch to the new design, so your site kept its current one. %s' ),
							applyError.message
						) }
					</Notice>
				) }
				{ applyError && redesign?.status === 'preview_ready' && (
					<Notice status="error" isDismissible={ false }>
						{ applyError.message }
					</Notice>
				) }
				{ renderBody() }
			</VStack>
		</Main>
	);
}
