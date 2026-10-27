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

type Props = {
	siteId: number;
	siteSlug: string;
	redesignId: string | null;
	resume: boolean;
};

const redesignKey = ( siteId: number, id: string | null ) => [ 'site-redesign', siteId, id ];

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
	redesign,
	candidate,
	index,
	onChoose,
	choosing,
}: {
	siteId: number;
	redesign: Redesign;
	candidate: Candidate;
	index: number;
	onChoose: ( candidate: Candidate ) => void;
	choosing: boolean;
} ) {
	return (
		<VStack className="site-redesign__candidate" spacing={ 3 }>
			<div className="site-redesign__thumbnail">
				{ candidate.status === 'succeeded' && (
					<CandidatePreview
						siteId={ siteId }
						redesignId={ redesign.id }
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
				disabled={
					candidate.status !== 'succeeded' || redesign.status !== 'preview_ready' || choosing
				}
				onClick={ () => onChoose( candidate ) }
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

	const redesignQuery = useQuery( {
		queryKey: redesignKey( siteId, redesignId ),
		queryFn: () => fetchRedesign( siteId, redesignId as string ),
		enabled: !! redesignId,
		refetchInterval: ( query ) =>
			POLLED_STATUSES.includes( query.state.data?.status ?? '' ) ? POLL_MS : false,
	} );
	const redesign = redesignQuery.data;

	const store = ( next: Redesign ) => {
		queryClient.setQueryData( redesignKey( siteId, next.id ), next );
		if ( next.id !== redesignId ) {
			page.replace( `/site-redesign/${ siteSlug }?redesign=${ encodeURIComponent( next.id ) }` );
		}
	};

	const start = useMutation( {
		mutationFn: async () => {
			const open = await openRedesign( siteId );
			const hasDesigns = [ 'generating', 'preview_ready', 'applying', 'installed' ].includes(
				open.status
			);
			return hasDesigns ? open : generateRedesign( siteId, open.id );
		},
		onMutate: () => setNotice( null ),
		onSuccess: store,
		onError: ( error ) => setNotice( messageOf( error ) ),
	} );

	const choose = useMutation( {
		mutationFn: ( generationId: string ) =>
			applyRedesign( siteId, redesign?.id as string, generationId ),
		onMutate: () => setNotice( null ),
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
		onMutate: () => setNotice( null ),
		onSuccess: store,
		onError: ( error ) => setNotice( messageOf( error ) ),
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

	const renderBody = () => {
		if ( ! redesignId ) {
			return (
				<VStack alignment="topLeft" spacing={ 4 }>
					<Text>
						{ __(
							'We’ll make four designs that keep your pages, posts and images. Choosing one asks for the Personal plan or higher.'
						) }
					</Text>
					<Button
						__next40pxDefaultSize
						variant="primary"
						isBusy={ start.isPending }
						disabled={ start.isPending }
						onClick={ () => start.mutate() }
					>
						{ __( 'Show me four designs' ) }
					</Button>
				</VStack>
			);
		}
		if ( redesignQuery.isError ) {
			return <Text>{ messageOf( redesignQuery.error ) }</Text>;
		}
		if ( ! redesign ) {
			return <Spinner />;
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
								href={ redesign.applied?.preview_url }
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
						<Button __next40pxDefaultSize variant="primary" href={ redesign.applied?.preview_url }>
							{ __( 'View site' ) }
						</Button>
					</VStack>
				);
			case 'interview':
			case 'failed':
			case 'rolled_back':
			case 'superseded':
				return (
					<VStack alignment="topLeft" spacing={ 4 }>
						{ redesign.status === 'failed' && (
							<Text>{ __( 'We couldn’t make designs for your site this time.' ) }</Text>
						) }
						<Button
							__next40pxDefaultSize
							variant="primary"
							isBusy={ start.isPending }
							disabled={ start.isPending }
							onClick={ () => start.mutate() }
						>
							{ __( 'Show me four designs' ) }
						</Button>
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
							redesign={ redesign }
							candidate={ candidate }
							index={ index }
							choosing={ choose.isPending }
							onChoose={ ( chosen ) => chooseCandidate( chosen.id ) }
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
