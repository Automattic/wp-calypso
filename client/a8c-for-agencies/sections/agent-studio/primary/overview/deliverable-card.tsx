import {
	Button,
	Card,
	CardBody,
	CardMedia,
	Spinner,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { dateI18n } from '@wordpress/date';
import { __, _n, sprintf } from '@wordpress/i18n';
import { Icon, page, warning } from '@wordpress/icons';
import clsx from 'clsx';
import { useState, type MouseEvent } from 'react';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import DeleteDeliverableDialog from './delete-deliverable-dialog';
import type { AgentStudioOutput } from '../../types';

import './style.scss';

interface Props {
	output: AgentStudioOutput;
}

export default function DeliverableCard( { output }: Props ) {
	const [ isDeleteDialogOpen, setIsDeleteDialogOpen ] = useState( false );
	const dispatch = useDispatch();

	const isOpenable = output.status === 'ready' && !! output.downloadUrl;

	const onCardClick = () => {
		if ( ! isOpenable || ! output.downloadUrl ) {
			return;
		}

		dispatch(
			recordTracksEvent( 'calypso_a4a_agent_studio_output_opened', {
				output_id: output.id,
			} )
		);
		window.open( output.downloadUrl, '_blank', 'noopener,noreferrer' );
	};

	const onDeleteClick = ( event: MouseEvent< HTMLButtonElement > ) => {
		event.stopPropagation();
		setIsDeleteDialogOpen( true );
	};

	return (
		<Card
			size="small"
			className={ clsx( 'a4a-agent-studio-deliverable-card', {
				'is-openable': isOpenable,
			} ) }
			onClick={ isOpenable ? onCardClick : undefined }
		>
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
				<HStack justify="flex-end">
					<Button variant="secondary" isDestructive onClick={ onDeleteClick }>
						{ __( 'Delete' ) }
					</Button>
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

	// Real one-pager outputs don't ship preview images yet — render a single
	// page icon + page count. The strip stays for forward-compat when image
	// previews land (see "Deferred gaps" in docs/api-migration.md).
	if ( ! output.previewUrls?.length ) {
		const pageCount = output.pageCount ?? 0;
		return (
			<div className="a4a-agent-studio-deliverable-card__state">
				<Icon icon={ page } size={ 32 } />
				{ pageCount > 0 && (
					<Text>
						{ sprintf(
							/* translators: %d is the number of pages in the deliverable. */
							_n( '%d page', '%d pages', pageCount ),
							pageCount
						) }
					</Text>
				) }
			</div>
		);
	}

	return (
		<div className="a4a-agent-studio-deliverable-card__strip">
			{ output.previewUrls.map( ( url ) => (
				<img key={ url } src={ url } alt="" />
			) ) }
		</div>
	);
}

function getMetaLabel( output: AgentStudioOutput ) {
	if ( output.status === 'generating' ) {
		return __( 'Generating…' );
	}

	if ( output.status === 'failed' ) {
		return __( 'Generation failed' );
	}

	// Prefer pageCount for one-pager-shaped outputs; fall back to assetCount
	// for social-assets-shape outputs.
	if ( output.pageCount !== undefined ) {
		return sprintf(
			/* translators: %d is the number of pages in the deliverable. */
			_n( '%d page', '%d pages', output.pageCount ),
			output.pageCount
		);
	}

	const count = output.assetCount ?? output.previewUrls?.length ?? 0;
	return sprintf(
		/* translators: %d is the number of generated assets. */
		_n( '%d asset', '%d assets', count ),
		count
	);
}
