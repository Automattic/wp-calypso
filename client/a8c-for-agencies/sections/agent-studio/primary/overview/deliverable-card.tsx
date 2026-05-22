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
import { __ } from '@wordpress/i18n';
import { Icon, moreVertical, page, trash, cautionFilled as warning } from '@wordpress/icons';
import { useEffect, useMemo, useState } from 'react';
import { getAgentStudioOutputPath } from '../../lib/paths';
import { peekBeaTile, renderBeaTile } from '../../social-design/services/beaRenderQueue';
import DeleteDeliverableDialog from './delete-deliverable-dialog';
import type { AgentStudioOutput, AgentStudioSocialAsset } from '../../types';

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
					{ output.status === 'ready' && (
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

	// Production path: server-rendered preview URLs land directly on the
	// output. We render them as <img> with no client-side work.
	if ( output.previewUrls?.length ) {
		return <PreviewUrlCollage urls={ output.previewUrls } />;
	}

	// PROTOTYPE-SWAP: fall back to rasterizing tiles from HTML in the browser
	// when `previewUrls` is absent (current local generation path). Remove
	// this branch once the wpcom service populates `previewUrls`.
	if ( output.kind === 'social-assets' && output.socialAssets?.assets.length ) {
		return <SocialAssetsCollage assets={ output.socialAssets.assets } />;
	}

	return (
		<div className="a4a-agent-studio-deliverable-card__placeholder">
			<Icon icon={ page } size={ 32 } />
		</div>
	);
}

function PreviewUrlCollage( { urls }: { urls: string[] } ) {
	return (
		<div className="a4a-agent-studio-deliverable-card__collage">
			{ urls.slice( 0, 4 ).map( ( url ) => (
				<div
					key={ url }
					className="a4a-agent-studio-deliverable-card__collage-tile"
					style={ { aspectRatio: '1 / 1' } }
				>
					<img src={ url } alt="" />
				</div>
			) ) }
		</div>
	);
}

const COLLAGE_ORDER: AgentStudioSocialAsset[ 'sizeKey' ][] = [
	'cover',
	'story',
	'square',
	'email',
];

function pickCollagePicks( assets: AgentStudioSocialAsset[] ): AgentStudioSocialAsset[] {
	const byKey = new Map< AgentStudioSocialAsset[ 'sizeKey' ], AgentStudioSocialAsset[] >();
	assets.forEach( ( asset ) => {
		const existing = byKey.get( asset.sizeKey ) ?? [];
		existing.push( asset );
		byKey.set( asset.sizeKey, existing );
	} );

	const picks: AgentStudioSocialAsset[] = [];
	for ( const key of COLLAGE_ORDER ) {
		const next = byKey.get( key )?.[ 0 ];
		if ( next ) {
			picks.push( next );
		}
		if ( picks.length >= 4 ) {
			break;
		}
	}

	if ( picks.length === 0 ) {
		return assets.slice( 0, 4 );
	}

	return picks;
}

// PROTOTYPE-SWAP: the prototype rasterizes each tile from HTML in the browser
// (cached in-memory by `beaRenderQueue`). In production, the wpcom service
// should pre-render thumbnails server-side at output-creation time and
// surface them as URLs on `AgentStudioOutput.previewUrls` — at which point
// this component can simply render `<img src={url} />` instead of calling
// `renderBeaTile`. See also: `socialAssets-viewer.tsx` for the full viewer.
function SocialAssetsCollage( { assets }: { assets: AgentStudioSocialAsset[] } ) {
	const picks = useMemo( () => pickCollagePicks( assets ), [ assets ] );

	return (
		<div className="a4a-agent-studio-deliverable-card__collage">
			{ picks.map( ( asset ) => (
				<CollageTile key={ asset.id } asset={ asset } />
			) ) }
		</div>
	);
}

function CollageTile( { asset }: { asset: AgentStudioSocialAsset } ) {
	const [ dataUrl, setDataUrl ] = useState< string | null >( () =>
		asset.html ? peekBeaTile( asset.html ) ?? null : null
	);

	useEffect( () => {
		if ( dataUrl || ! asset.html ) {
			return;
		}
		let cancelled = false;
		renderBeaTile( asset.html, { width: asset.width, height: asset.height, label: asset.label } )
			.then( ( url ) => {
				if ( ! cancelled ) {
					setDataUrl( url );
				}
			} )
			.catch( () => {} );
		return () => {
			cancelled = true;
		};
	}, [ dataUrl, asset.html, asset.width, asset.height, asset.label ] );

	return (
		<div
			className="a4a-agent-studio-deliverable-card__collage-tile"
			style={ { aspectRatio: `${ asset.width } / ${ asset.height }` } }
		>
			{ dataUrl && <img src={ dataUrl } alt="" /> }
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

	return output.deliverableType;
}
