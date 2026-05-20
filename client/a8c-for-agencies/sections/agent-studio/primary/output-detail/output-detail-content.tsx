import {
	Button,
	Notice,
	Spinner,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useMemo, useState } from 'react';
import useAgentStudioCollateral, {
	type AgentStudioCollateralVariant,
} from '../../data/use-agent-studio-collateral';
import useAgentStudioRun, { type AgentStudioRunPayload } from '../../data/use-agent-studio-run';
import useAgentStudioVariantHtml from '../../data/use-agent-studio-variant-html';
import usePrefetchAgentStudioVariantHtml from '../../data/use-prefetch-agent-studio-variant-html';
import PdfViewer, { type PdfViewerPage } from './pdf-viewer';
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

export default function OutputDetailContent( { output }: Props ) {
	const run = useAgentStudioRun( output.id );
	const postId = extractPostId( run.data?.payload );
	const collateral = useAgentStudioCollateral( postId );

	const variants = useMemo< AgentStudioCollateralVariant[] >(
		() => collateral.data?.variants ?? [],
		[ collateral.data ]
	);
	usePrefetchAgentStudioVariantHtml( variants.map( ( variant ) => variant.html_url ) );

	// Local-only flip — PR #4 will replace this with the optimistic
	// mutation against `POST /collateral/<post_id>/selected-variant`
	// (the backend write endpoint is specced but not yet shipped).
	const initialIndex = pickInitialVariantIndex( variants, collateral.data?.selected_variant_id );
	const [ activeIndex, setActiveIndex ] = useState( initialIndex );
	const safeIndex = variants.length > 0 ? Math.min( activeIndex, variants.length - 1 ) : 0;
	const selectedVariant = variants[ safeIndex ];

	const variantHtml = useAgentStudioVariantHtml( selectedVariant?.html_url );

	const pages = useMemo< PdfViewerPage[] >( () => {
		if ( ! variantHtml.data ) {
			return [];
		}
		return splitIntoPages( variantHtml.data ).map( ( page, idx ) => ( {
			srcDoc: wrapAsDocument( page ),
			role: idx === 0 ? ( 'cover' as const ) : ( 'body' as const ),
		} ) );
	}, [ variantHtml.data ] );

	if ( output.status === 'generating' || ( ! postId && run.isLoading ) ) {
		return (
			<VStack className="a4a-agent-studio-output-detail__state" alignment="center" spacing={ 3 }>
				<Spinner />
				<Text>{ __( 'Generating your deliverable…' ) }</Text>
			</VStack>
		);
	}

	if ( output.status === 'failed' ) {
		return (
			<VStack className="a4a-agent-studio-output-detail__state" alignment="center" spacing={ 3 }>
				<Text size={ 15 } weight={ 600 }>
					{ __( 'Generation failed' ) }
				</Text>
				{ output.errorMessage && <Text variant="muted">{ output.errorMessage }</Text> }
			</VStack>
		);
	}

	if ( ! postId ) {
		return (
			<VStack className="a4a-agent-studio-output-detail__state" alignment="center" spacing={ 3 }>
				<Text>{ __( 'No preview is available for this deliverable yet.' ) }</Text>
			</VStack>
		);
	}

	if ( collateral.isLoading ) {
		return (
			<VStack className="a4a-agent-studio-output-detail__state" alignment="center" spacing={ 3 }>
				<Spinner />
				<Text>{ __( 'Loading preview…' ) }</Text>
			</VStack>
		);
	}

	if ( collateral.isError || ! variants.length ) {
		return (
			<VStack className="a4a-agent-studio-output-detail__state" alignment="center" spacing={ 3 }>
				<Notice status="warning" isDismissible={ false }>
					{ __( 'We couldn’t load the preview for this deliverable.' ) }
				</Notice>
			</VStack>
		);
	}

	return (
		<VStack spacing={ 4 } className="a4a-agent-studio-output-detail__content">
			<HStack className="a4a-agent-studio-output-detail__actions" justify="flex-end" spacing={ 2 }>
				{ selectedVariant?.pdf_download_url && (
					<Button
						variant="primary"
						href={ selectedVariant.pdf_download_url }
						target="_blank"
						rel="noopener noreferrer"
					>
						{ __( 'Download PDF' ) }
					</Button>
				) }
			</HStack>
			{ variantHtml.isLoading ? (
				<VStack className="a4a-agent-studio-output-detail__state" alignment="center" spacing={ 3 }>
					<Spinner />
					<Text>{ __( 'Loading preview…' ) }</Text>
				</VStack>
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
				/>
			) }
		</VStack>
	);
}
