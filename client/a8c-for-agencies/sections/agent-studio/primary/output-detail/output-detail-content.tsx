import {
	Button,
	Spinner,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { useEffect, useState } from 'react';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { errorNotice } from 'calypso/state/notices/actions';
import useUpdateAgentStudioOutput from '../../data/use-update-agent-studio-output';
import { ELA_PAGE_HEIGHT, ELA_PAGE_WIDTH } from '../../one-pager/engine/types';
import { getOnePagerServices } from '../../one-pager/services';
import PdfViewer, { type PdfViewerPage } from './pdf-viewer';
import type { PageRender } from '../../one-pager/services/types';
import type { AgentStudioOutput } from '../../types';

import './style.scss';

interface Props {
	output: AgentStudioOutput;
}

export default function OutputDetailContent( { output }: Props ) {
	const dispatch = useDispatch();
	const [ isDownloading, setIsDownloading ] = useState( false );
	const updateOutput = useUpdateAgentStudioOutput();
	// Local cover index keeps the chevrons feel instant — we don't wait for
	// the persisted state to round-trip through IndexedDB + React Query.
	const persistedCoverIdx = output.onePagerData?.selectedCoverIdx ?? 0;
	const [ activeCoverIdx, setActiveCoverIdx ] = useState( persistedCoverIdx );
	useEffect( () => {
		setActiveCoverIdx( persistedCoverIdx );
	}, [ output.id, persistedCoverIdx ] );

	if ( output.status === 'generating' ) {
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

	const data = output.onePagerData;
	if ( ! data || data.covers.length === 0 ) {
		return (
			<VStack className="a4a-agent-studio-output-detail__state" alignment="center" spacing={ 3 }>
				<Text>{ __( 'No preview available.' ) }</Text>
			</VStack>
		);
	}

	const safeCoverIdx = Math.min( activeCoverIdx, Math.max( 0, data.covers.length - 1 ) );
	const selectedCover = data.covers[ safeCoverIdx ];

	const onSelectCover = ( nextIdx: number ) => {
		setActiveCoverIdx( nextIdx );
		updateOutput.mutate( {
			outputId: output.id,
			updates: { onePagerData: { ...data, selectedCoverIdx: nextIdx } },
		} );
	};

	const onDownload = async () => {
		setIsDownloading( true );
		try {
			const pages: PageRender[] = [
				{
					html: selectedCover.html,
					width: ELA_PAGE_WIDTH,
					height: ELA_PAGE_HEIGHT,
					role: 'cover',
					theme: selectedCover.theme,
					coverLayoutId: selectedCover.layoutId,
				},
				...data.bodyPages.map( ( html ) => ( {
					html,
					width: ELA_PAGE_WIDTH,
					height: ELA_PAGE_HEIGHT,
					role: 'body' as const,
				} ) ),
			];
			const { blob, fileName } = await getOnePagerServices().pdf.exportPdf( {
				title: output.title,
				pages,
			} );
			const url = URL.createObjectURL( blob );
			const a = document.createElement( 'a' );
			a.href = url;
			a.download = fileName;
			document.body.appendChild( a );
			a.click();
			a.remove();
			URL.revokeObjectURL( url );
			dispatch(
				recordTracksEvent( 'calypso_a4a_agent_studio_one_pager_download', {
					output_id: output.id,
					download_type: 'pdf',
				} )
			);
		} catch ( error ) {
			const message =
				error instanceof Error
					? error.message
					: __( 'Could not export the PDF. Please try again.' );
			dispatch( errorNotice( message ) );
		} finally {
			setIsDownloading( false );
		}
	};

	const totalPages = data.bodyPages.length + 1;

	const viewerPages: PdfViewerPage[] = [
		{ html: selectedCover.html, role: 'cover' },
		...data.bodyPages.map( ( html ) => ( { html, role: 'body' as const } ) ),
	];

	return (
		<VStack spacing={ 5 } className="a4a-agent-studio-output-detail__content">
			<HStack
				alignment="center"
				justify="space-between"
				className="a4a-agent-studio-output-detail__header"
			>
				<VStack spacing={ 1 }>
					<Text size={ 20 } weight={ 600 }>
						{ output.title }
					</Text>
					<Text variant="muted">
						{ sprintf(
							/* translators: %d is a page count. */
							__( '%d pages' ),
							totalPages
						) }
					</Text>
				</VStack>
				<Button
					variant="primary"
					onClick={ onDownload }
					isBusy={ isDownloading }
					disabled={ isDownloading }
				>
					{ isDownloading ? __( 'Building PDF…' ) : __( 'Download PDF' ) }
				</Button>
			</HStack>

			<PdfViewer
				pages={ viewerPages }
				coverNavigation={
					data.covers.length > 1
						? {
								count: data.covers.length,
								activeIndex: safeCoverIdx,
								onSelect: onSelectCover,
						  }
						: undefined
				}
			/>
		</VStack>
	);
}
