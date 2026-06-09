import { useQuery } from '@tanstack/react-query';
import {
	Button,
	Notice,
	Spinner,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import useAgentStudioCollateral, {
	type AgentStudioCollateralVariant,
} from '../../data/use-agent-studio-collateral';
import useAgentStudioRun, {
	NON_TERMINAL_RUN_STATUSES,
	type AgentStudioRunPayload,
} from '../../data/use-agent-studio-run';
import useAgentStudioVariantHtml from '../../data/use-agent-studio-variant-html';
import usePrefetchAgentStudioVariantHtml from '../../data/use-prefetch-agent-studio-variant-html';
import {
	composeSocialAssetsFromBrief,
	type ServerSocialBrief,
} from '../../social-design/create-social-assets';
import PdfViewer, { type PdfViewerPage } from './pdf-viewer';
import RefineLauncher from './refine-launcher';
import RefineWithAiDock from './refine-with-ai-dock';
import SocialAssetsViewer from './social-assets-viewer';
import { splitIntoPages, wrapAsDocument } from './split-pages';
import type { AgentStudioOutput } from '../../types';

interface Props {
	output: AgentStudioOutput;
}

const extractPostId = ( payload: unknown ): number | undefined => {
	if ( ! payload || typeof payload !== 'object' ) {
		return undefined;
	}
	const candidate = ( payload as AgentStudioRunPayload ).post_id;
	return typeof candidate === 'number' && candidate > 0 ? candidate : undefined;
};

const pickInitialVariantIndex = (
	variants: AgentStudioCollateralVariant[],
	selectedVariantId: string | null | undefined
): number => {
	if ( ! variants.length || ! selectedVariantId ) {
		return 0;
	}
	const idx = variants.findIndex( ( variant ) => variant.variant_id === selectedVariantId );
	return idx >= 0 ? idx : 0;
};

function StateMessage( { children, spinner }: { children: ReactNode; spinner?: boolean } ) {
	return (
		<VStack className="a4a-agent-studio-output-detail__state" alignment="center" spacing={ 3 }>
			{ spinner && <Spinner /> }
			{ children }
		</VStack>
	);
}

interface RefineSeed {
	text: string;
	token: number;
}

function OnePagerOutputDetail( { output }: Props ) {
	const dispatch = useDispatch();
	const run = useAgentStudioRun( output.id );
	const postId = extractPostId( run.data?.payload );
	const collateral = useAgentStudioCollateral( postId );
	const [ isRefineOpen, setIsRefineOpen ] = useState( false );
	// `token` bumps on every open request so re-opening the same page re-seeds
	// the dock input even when the seed text is identical.
	const [ refineSeed, setRefineSeed ] = useState< RefineSeed >( { text: '', token: 0 } );

	const openRefine = useCallback(
		( seedText: string, source: 'launcher' | 'page', page?: number ) => {
			setRefineSeed( ( prev ) => ( { text: seedText, token: prev.token + 1 } ) );
			setIsRefineOpen( true );
			dispatch(
				recordTracksEvent( 'calypso_a4a_agent_studio_refine_open', {
					output_id: output.id,
					source,
					...( page ? { page } : {} ),
				} )
			);
		},
		[ dispatch, output.id ]
	);

	const handleEditPage = useCallback(
		( pageNumber: number ) => {
			openRefine(
				// Trailing space added outside the translatable string.
				sprintf(
					/* translators: %d is the 1-based page number, cover included. */
					__( 'On page %d, make the following edits:' ),
					pageNumber
				) + ' ',
				'page',
				pageNumber
			);
		},
		[ openRefine ]
	);

	const variants = useMemo< AgentStudioCollateralVariant[] >(
		() => collateral.data?.variants ?? [],
		[ collateral.data?.variants ]
	);
	usePrefetchAgentStudioVariantHtml( variants.map( ( variant ) => variant.html_url ) );

	const [ activeIndex, setActiveIndex ] = useState( () =>
		pickInitialVariantIndex( variants, collateral.data?.selected_variant_id )
	);
	const safeIndex = variants.length > 0 ? Math.min( activeIndex, variants.length - 1 ) : 0;
	const selectedVariant = variants[ safeIndex ];

	// Cover comes from the selected variant; body pages come from
	// variant 0 always. Per cover-variant-picker-v2 ADR-0001 the theme
	// is scoped to the cover only, so body srcDocs are stable across
	// chevron flips and React skips the body shadow-root rebuild.
	const selectedVariantHtml = useAgentStudioVariantHtml( selectedVariant?.html_url );
	const baseVariantHtml = useAgentStudioVariantHtml( variants[ 0 ]?.html_url );

	const coverSrcDoc = useMemo< string | undefined >( () => {
		if ( ! selectedVariantHtml.data ) {
			return undefined;
		}
		const split = splitIntoPages( selectedVariantHtml.data );
		return split[ 0 ] ? wrapAsDocument( split[ 0 ] ) : undefined;
	}, [ selectedVariantHtml.data ] );

	const bodySrcDocs = useMemo< string[] >( () => {
		if ( ! baseVariantHtml.data ) {
			return [];
		}
		const split = splitIntoPages( baseVariantHtml.data );
		return split.slice( 1 ).map( ( page ) => wrapAsDocument( page ) );
	}, [ baseVariantHtml.data ] );

	const pages = useMemo< PdfViewerPage[] >( () => {
		if ( ! coverSrcDoc ) {
			return [];
		}
		return [
			{ srcDoc: coverSrcDoc, role: 'cover' as const },
			...bodySrcDocs.map( ( srcDoc ) => ( { srcDoc, role: 'body' as const } ) ),
		];
	}, [ coverSrcDoc, bodySrcDocs ] );

	if ( output.status === 'generating' || ( ! postId && run.isLoading ) ) {
		return (
			<StateMessage spinner>
				<Text>{ __( 'Generating your deliverable…' ) }</Text>
			</StateMessage>
		);
	}

	if ( output.status === 'failed' ) {
		return (
			<StateMessage>
				<Text size={ 15 } weight={ 600 }>
					{ __( 'Generation failed' ) }
				</Text>
				{ output.errorMessage && <Text variant="muted">{ output.errorMessage }</Text> }
			</StateMessage>
		);
	}

	if ( ! postId ) {
		return (
			<StateMessage>
				<Text>{ __( 'No preview is available for this deliverable yet.' ) }</Text>
			</StateMessage>
		);
	}

	if ( collateral.isLoading ) {
		return (
			<StateMessage spinner>
				<Text>{ __( 'Loading preview…' ) }</Text>
			</StateMessage>
		);
	}

	if ( collateral.isError || ! variants.length ) {
		return (
			<StateMessage>
				<Notice status="warning" isDismissible={ false }>
					{ __( 'We couldn’t load the preview for this deliverable.' ) }
				</Notice>
			</StateMessage>
		);
	}

	return (
		<VStack spacing={ 4 } className="a4a-agent-studio-output-detail__content">
			{ selectedVariant?.pdf_download_url && (
				<HStack
					className="a4a-agent-studio-output-detail__actions"
					justify="flex-end"
					spacing={ 2 }
				>
					<Button
						variant="primary"
						href={ selectedVariant.pdf_download_url }
						target="_blank"
						rel="noopener noreferrer"
					>
						{ __( 'Download PDF' ) }
					</Button>
				</HStack>
			) }
			{ ! coverSrcDoc && ( selectedVariantHtml.isLoading || baseVariantHtml.isLoading ) ? (
				<StateMessage spinner>
					<Text>{ __( 'Loading preview…' ) }</Text>
				</StateMessage>
			) : (
				<PdfViewer
					pages={ pages }
					coverNavigation={
						variants.length > 1
							? {
									count: variants.length,
									activeIndex: safeIndex,
									onSelect: setActiveIndex,
							  }
							: undefined
					}
					onEditPage={ postId ? handleEditPage : undefined }
				/>
			) }
			{ ! isRefineOpen && postId && (
				<RefineLauncher onClick={ () => openRefine( '', 'launcher' ) } />
			) }
			{ isRefineOpen && postId && (
				<RefineWithAiDock
					collateralPostId={ postId }
					totalPages={ pages.length }
					seedText={ refineSeed.text }
					seedToken={ refineSeed.token }
					onClose={ () => setIsRefineOpen( false ) }
				/>
			) }
		</VStack>
	);
}

interface SocialRunPayload extends AgentStudioRunPayload {
	brief?: ServerSocialBrief;
}

const extractSocialBrief = ( payload: unknown ): ServerSocialBrief | undefined => {
	if ( ! payload || typeof payload !== 'object' ) {
		return undefined;
	}
	const brief = ( payload as SocialRunPayload ).brief;
	if ( ! brief || typeof brief !== 'object' || typeof brief.headline !== 'string' ) {
		return undefined;
	}
	return brief;
};

function SocialOutputDetail( { output }: Props ) {
	const run = useAgentStudioRun( output.id );
	const brief = extractSocialBrief( run.data?.payload );
	const postId = extractPostId( run.data?.payload );

	// Compose tiles client-side. The deterministic projector and the
	// HTML composer live in `social-design/`; this query memoises the
	// result so the canvas doesn't re-fit every render.
	const composed = useQuery( {
		queryKey: [ 'a4a-agent-studio-social-tiles', output.id, brief ],
		queryFn: () => composeSocialAssetsFromBrief( { brief: brief as ServerSocialBrief } ),
		enabled: !! brief,
		staleTime: Infinity,
		refetchOnWindowFocus: false,
	} );

	const runStatus = run.data?.status;
	const isRunFailed = output.status === 'failed' || runStatus === 'a4a_failed';
	// The server-reported status of the run can lag the optimistic
	// outputs-list status set right after submit, and the polling on
	// `useAgentStudioRun` won't have settled the response yet. Treat
	// "we don't have run.data yet" and "the server says still running"
	// the same way — keep the spinner up until the persist ability
	// emits a brief into payload. Without this, the page briefly
	// renders "No preview is available" between the outputs-list
	// refetch and the first run-payload arrival.
	const isRunInProgress =
		! isRunFailed &&
		( output.status === 'generating' ||
			( runStatus !== undefined && NON_TERMINAL_RUN_STATUSES.has( runStatus ) ) ||
			( ! run.data && ! run.isError ) );

	if ( isRunFailed ) {
		return (
			<StateMessage>
				<Text size={ 15 } weight={ 600 }>
					{ __( 'Generation failed' ) }
				</Text>
				{ output.errorMessage && <Text variant="muted">{ output.errorMessage }</Text> }
			</StateMessage>
		);
	}

	if ( isRunInProgress ) {
		return (
			<StateMessage spinner>
				<Text>{ __( 'Generating your deliverable…' ) }</Text>
			</StateMessage>
		);
	}

	if ( ! brief || ! postId ) {
		return (
			<StateMessage>
				<Text>{ __( 'No preview is available for this deliverable yet.' ) }</Text>
			</StateMessage>
		);
	}

	if ( composed.isLoading || ! composed.data ) {
		return (
			<StateMessage spinner>
				<Text>{ __( 'Loading preview…' ) }</Text>
			</StateMessage>
		);
	}

	return (
		<SocialAssetsViewer assets={ composed.data.assets } title={ output.title } postId={ postId } />
	);
}

export default function OutputDetailContent( { output }: Props ) {
	if ( output.deliverableType === 'social-assets' ) {
		return <SocialOutputDetail output={ output } />;
	}

	return <OnePagerOutputDetail output={ output } />;
}
