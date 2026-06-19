import {
	Button,
	Modal,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { useSetSpaceLayoutView, useSpace } from 'calypso/reader/data/spaces';
import { DEFAULT_SPACE_FEED_LAYOUT } from 'calypso/reader/spaces/feed/layouts/registry';
import { useDispatch } from 'calypso/state';
import { successNotice } from 'calypso/state/notices/actions';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import type { SpaceFeedLayout } from '@automattic/api-core';

import './style.scss';

interface Props {
	isOpen: boolean;
	spaceId: string | null;
	onClose: () => void;
}

export function CustomizeModal( { isOpen, spaceId, onClose }: Props ) {
	// Mount fresh each open so the selection resets to the space's current layout.
	if ( ! isOpen || ! spaceId ) {
		return null;
	}
	return <CustomizeModalContent spaceId={ spaceId } onClose={ onClose } />;
}

function CustomizeModalContent( { spaceId, onClose }: { spaceId: string; onClose: () => void } ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const { data: space } = useSpace( spaceId );
	const setLayoutView = useSetSpaceLayoutView();

	const presets: { id: SpaceFeedLayout; title: string; description: string }[] = [
		{
			id: 'standard-list',
			title: translate( 'List' ),
			description: translate( 'Many items, fast scanning' ),
		},
		{
			id: 'magazine',
			title: translate( 'Magazine' ),
			description: translate( 'One comfortable column' ),
		},
		{
			id: 'gallery',
			title: translate( 'Gallery' ),
			description: translate( 'Grid of cards with thumbnails' ),
		},
		{
			id: 'board',
			title: translate( 'Board' ),
			description: translate( 'Big roomy cards, casual scroll' ),
		},
		{
			id: 'legacy',
			title: translate( 'Legacy' ),
			description: translate( 'Classic Reader stream' ),
		},
	];

	const [ selected, setSelected ] = useState< SpaceFeedLayout >(
		space?.layout.view ?? DEFAULT_SPACE_FEED_LAYOUT
	);

	useEffect( () => {
		if ( space ) {
			setSelected( space.layout.view ?? DEFAULT_SPACE_FEED_LAYOUT );
		}
	}, [ space ] );

	const handleSave = () => {
		if ( ! space ) {
			return;
		}
		setLayoutView( spaceId, selected );
		dispatch(
			recordReaderTracksEvent( 'calypso_reader_spaces_layout_changed', { layout: selected } )
		);
		dispatch( successNotice( translate( 'Layout updated.' ), { duration: 5000 } ) );
		onClose();
	};

	return (
		<Modal title={ translate( 'Customize space' ) } size="medium" onRequestClose={ onClose }>
			<VStack spacing={ 4 }>
				<p className="customize-space-modal__subtitle">
					{ translate( 'Choose a layout for this space.' ) }
				</p>
				<div
					className="customize-space-modal__grid"
					role="radiogroup"
					aria-label={ translate( 'Layout' ) }
				>
					{ presets.map( ( preset ) => (
						<label
							key={ preset.id }
							className="customize-space-modal__card"
							data-selected={ preset.id === selected }
						>
							<input
								type="radio"
								className="customize-space-modal__radio"
								name="space-layout-view"
								value={ preset.id }
								checked={ preset.id === selected }
								onChange={ () => setSelected( preset.id ) }
							/>
							<span className="customize-space-modal__card-title">{ preset.title }</span>
							<span className="customize-space-modal__card-description">
								{ preset.description }
							</span>
						</label>
					) ) }
				</div>
				<HStack justify="flex-end" spacing={ 2 }>
					<Button __next40pxDefaultSize variant="tertiary" onClick={ onClose }>
						{ translate( 'Cancel' ) }
					</Button>
					<Button
						__next40pxDefaultSize
						variant="primary"
						disabled={ ! space }
						onClick={ handleSave }
					>
						{ translate( 'Save changes' ) }
					</Button>
				</HStack>
			</VStack>
		</Modal>
	);
}
