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
import { Icon, warning } from '@wordpress/icons';
import { useState } from 'react';
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
				<HStack justify="flex-end">
					<Button variant="secondary" isDestructive onClick={ () => setIsDeleteDialogOpen( true ) }>
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

	return (
		<div className="a4a-agent-studio-deliverable-card__strip">
			{ output.previewUrls?.map( ( url ) => <img key={ url } src={ url } alt="" /> ) }
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

	const count = output.assetCount ?? output.previewUrls?.length ?? 0;
	return sprintf(
		/* translators: %d is the number of generated assets. */
		_n( '%d asset', '%d assets', count ),
		count
	);
}
