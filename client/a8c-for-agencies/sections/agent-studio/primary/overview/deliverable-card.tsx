import {
	Button,
	Card,
	CardBody,
	CardMedia,
	DropdownMenu,
	Spinner,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { dateI18n } from '@wordpress/date';
import { __, _n, sprintf } from '@wordpress/i18n';
import { Icon, moreVertical, trash, warning } from '@wordpress/icons';
import { useEffect, useRef, useState } from 'react';
import useUpdateAgentStudioOutput from '../../data/use-update-agent-studio-output';
import { getAgentStudioOutputPath } from '../../lib/paths';
import { ELA_PAGE_HEIGHT, ELA_PAGE_WIDTH } from '../../one-pager/engine/types';
import { getOnePagerServices } from '../../one-pager/services';
import DeleteDeliverableDialog from './delete-deliverable-dialog';
import type { AgentStudioOutput } from '../../types';

import './style.scss';

interface Props {
	output: AgentStudioOutput;
}

export default function DeliverableCard( { output }: Props ) {
	const [ isDeleteDialogOpen, setIsDeleteDialogOpen ] = useState( false );

	return (
		<Card size="small" className="a4a-agent-studio-deliverable-card">
			<CardMedia className="a4a-agent-studio-deliverable-card__media">
				<DeliverablePreview output={ output } />
			</CardMedia>
			<CardBody className="a4a-agent-studio-deliverable-card__body">
				<VStack spacing={ 1 } className="a4a-agent-studio-deliverable-card__info">
					<Text size={ 15 } weight={ 600 } className="a4a-agent-studio-deliverable-card__title">
						{ output.title }
					</Text>
					<Text variant="muted">{ dateI18n( 'F j, Y', output.createdAt ) }</Text>
					<Text variant="muted">{ getMetaLabel( output ) }</Text>
				</VStack>
				<HStack justify="space-between" alignment="center">
					{ output.kind === 'one-pager' && output.status === 'ready' && (
						<Button variant="secondary" href={ getAgentStudioOutputPath( output.id ) }>
							{ __( 'View' ) }
						</Button>
					) }
					<DropdownMenu
						icon={ moreVertical }
						label={ __( 'Deliverable actions' ) }
						controls={ [
							{
								title: __( 'Delete' ),
								icon: trash,
								onClick: () => setIsDeleteDialogOpen( true ),
							},
						] }
					/>
				</HStack>
			</CardBody>
			{ isDeleteDialogOpen && (
				<DeleteDeliverableDialog
					output={ output }
					onClose={ () => setIsDeleteDialogOpen( false ) }
					onDeleted={ () => setIsDeleteDialogOpen( false ) }
				/>
			) }
		</Card>
	);
}

function DeliverablePreview( { output }: Props ) {
	useOnePagerCoverBackfill( output );

	if ( output.status === 'generating' ) {
		return (
			<div className="a4a-agent-studio-deliverable-card__state">
				<Spinner />
				<Text>{ __( 'Generating…' ) }</Text>
			</div>
		);
	}

	if ( output.status === 'failed' ) {
		return (
			<div className="a4a-agent-studio-deliverable-card__state">
				<Icon icon={ warning } size={ 24 } />
				<Text>{ __( 'Generation failed' ) }</Text>
			</div>
		);
	}

	if ( output.kind === 'one-pager' && ! output.previewUrls?.length ) {
		// Thumbnails are still being snapshotted by the backfill effect.
		return (
			<div className="a4a-agent-studio-deliverable-card__state">
				<Spinner />
			</div>
		);
	}

	return (
		<div className="a4a-agent-studio-deliverable-card__strip">
			{ output.previewUrls?.map( ( url ) => <img key={ url } src={ url } alt="" /> ) }
		</div>
	);
}

/**
 * Generates a cover thumbnail for a finished one-pager that doesn't have one
 * yet and persists it back on the output. Covers outputs created before the
 * thumbnail snapshot was added to the generation flow, and any that lost
 * their thumb to an IDB reset.
 */
function useOnePagerCoverBackfill( output: AgentStudioOutput ): void {
	const updateOutput = useUpdateAgentStudioOutput();
	const inFlightRef = useRef( false );

	useEffect( () => {
		if ( output.kind !== 'one-pager' ) {
			return;
		}
		if ( output.status !== 'ready' ) {
			return;
		}
		const data = output.onePagerData;
		const cover = data?.covers[ data.selectedCoverIdx ?? 0 ];
		if ( ! cover || ! data ) {
			return;
		}
		// Expect cover + first 3 body pages, capped at the actual page count.
		// Re-snapshot when fewer thumbs were persisted than we'd render now —
		// covers outputs that were generated before the magazine strip
		// shipped with only a single cover thumb.
		const expected = Math.min( 4, 1 + data.bodyPages.length );
		if ( output.previewUrls && output.previewUrls.length >= expected ) {
			return;
		}
		if ( inFlightRef.current ) {
			return;
		}
		inFlightRef.current = true;
		let cancelled = false;
		( async () => {
			try {
				const thumbnail = getOnePagerServices().thumbnail;
				const htmls = [ cover.html, ...data.bodyPages.slice( 0, 3 ) ];
				const dataUrls: string[] = [];
				for ( const html of htmls ) {
					if ( cancelled ) {
						return;
					}
					const dataUrl = await thumbnail.renderPagePng( {
						html,
						width: ELA_PAGE_WIDTH,
						height: ELA_PAGE_HEIGHT,
					} );
					if ( dataUrl ) {
						dataUrls.push( dataUrl );
					}
				}
				if ( cancelled || dataUrls.length === 0 ) {
					return;
				}
				updateOutput.mutate( {
					outputId: output.id,
					updates: { previewUrls: dataUrls },
				} );
			} catch ( error ) {
				// eslint-disable-next-line no-console
				console.warn( '[one-pager card] thumbnail backfill failed:', error );
			} finally {
				inFlightRef.current = false;
			}
		} )();
		return () => {
			cancelled = true;
		};
	}, [
		output.id,
		output.kind,
		output.status,
		output.previewUrls,
		output.onePagerData,
		updateOutput,
	] );
}

function getMetaLabel( output: AgentStudioOutput ) {
	if ( output.status === 'generating' ) {
		return __( 'Generating…' );
	}

	if ( output.status === 'failed' ) {
		return __( 'Generation failed' );
	}

	const count = output.assetCount ?? output.previewUrls?.length ?? 0;
	return sprintf(
		/* translators: %d is the number of generated assets. */
		_n( '%d asset', '%d assets', count ),
		count
	);
}
