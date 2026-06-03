import {
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
import { __ } from '@wordpress/i18n';
import { Icon, moreVertical, page, trash, cautionFilled as warning } from '@wordpress/icons';
import clsx from 'clsx';
import { useState } from 'react';
import useDeliverableTitle from '../../data/use-deliverable-title';
import { getAgentStudioOutputPath } from '../../lib/paths';
import DeleteDeliverableDialog from './delete-deliverable-dialog';
import type { AgentStudioOutput } from '../../types';

import './style.scss';

interface Props {
	output: AgentStudioOutput;
}

export default function DeliverableCard( { output }: Props ) {
	const [ isDeleteDialogOpen, setIsDeleteDialogOpen ] = useState( false );
	const title = useDeliverableTitle( output );
	const isReady = output.status === 'ready';

	return (
		<Card
			size="small"
			className={ clsx( 'a4a-agent-studio-deliverable-card', { 'is-clickable': isReady } ) }
		>
			<CardMedia className="a4a-agent-studio-deliverable-card__media">
				<DeliverablePreview output={ output } />
			</CardMedia>
			<CardBody className="a4a-agent-studio-deliverable-card__body">
				<HStack justify="space-between" alignment="flex-start" spacing={ 2 }>
					<VStack spacing={ 1 } className="a4a-agent-studio-deliverable-card__info">
						<Text size={ 15 } weight={ 600 } className="a4a-agent-studio-deliverable-card__title">
							{ title }
						</Text>
						<Text variant="muted">{ dateI18n( 'F j, Y', output.createdAt ) }</Text>
					</VStack>
					{ /* Sits above the card-wide link overlay so its clicks aren't swallowed. */ }
					<div className="a4a-agent-studio-deliverable-card__menu">
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
					</div>
				</HStack>
			</CardBody>
			{ /* Stretched link makes the whole card open the deliverable without
			     nesting interactive elements inside one another. */ }
			{ isReady && (
				<a
					className="a4a-agent-studio-deliverable-card__link"
					href={ getAgentStudioOutputPath( output.id ) }
					aria-label={ title }
				/>
			) }
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
		<div className="a4a-agent-studio-deliverable-card__placeholder">
			<Icon icon={ page } size={ 32 } />
		</div>
	);
}
