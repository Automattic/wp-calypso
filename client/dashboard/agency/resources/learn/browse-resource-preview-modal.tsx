import { Badge } from '@automattic/ui';
import {
	Button,
	Modal,
	Icon,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { download } from '@wordpress/icons';
import { AUDIENCE_LABELS, PREVIEW_ICON } from './browse-resources-data';
import type { PrototypeResource, PreviewType } from './browse-resources-types';

const FRAME_BACKGROUND = 'rgba( 127, 127, 127, 0.1 )';
const FRAME_BORDER = '1px solid rgba( 127, 127, 127, 0.3 )';

function PlaceholderLine( { width }: { width: string } ) {
	return (
		<div
			style={ {
				blockSize: '10px',
				inlineSize: width,
				borderRadius: '4px',
				background: 'rgba( 127, 127, 127, 0.25 )',
			} }
		/>
	);
}

function CenteredFrame( {
	previewType,
	label,
	aspectRatio,
	dark = false,
}: {
	previewType: PreviewType;
	label: string;
	aspectRatio: string;
	dark?: boolean;
} ) {
	return (
		<div
			style={ {
				display: 'flex',
				flexDirection: 'column',
				gap: '12px',
				alignItems: 'center',
				justifyContent: 'center',
				aspectRatio,
				inlineSize: '100%',
				borderRadius: '4px',
				border: dark ? 'none' : FRAME_BORDER,
				background: dark ? 'rgba( 0, 0, 0, 0.85 )' : FRAME_BACKGROUND,
				color: dark ? '#fff' : 'var( --color-text-subtle, currentColor )',
			} }
		>
			<Icon icon={ PREVIEW_ICON[ previewType ] } size={ 56 } />
			<Text style={ { color: 'inherit' } }>{ label }</Text>
		</div>
	);
}

function PreviewArea( { resource }: { resource: PrototypeResource } ) {
	switch ( resource.previewType ) {
		case 'video':
			return (
				<CenteredFrame
					previewType="video"
					aspectRatio="16 / 9"
					dark
					label={ __( 'Video player placeholder' ) }
				/>
			);
		case 'slides':
			return (
				<CenteredFrame
					previewType="slides"
					aspectRatio="16 / 9"
					label={ __( 'Slide deck placeholder' ) }
				/>
			);
		case 'pdf':
			return (
				<div
					style={ {
						display: 'flex',
						justifyContent: 'center',
						padding: '24px',
						borderRadius: '4px',
						background: FRAME_BACKGROUND,
					} }
				>
					<VStack
						spacing={ 3 }
						style={ {
							inlineSize: '100%',
							maxInlineSize: '420px',
							aspectRatio: '8.5 / 11',
							padding: '28px',
							borderRadius: '2px',
							border: FRAME_BORDER,
							background: 'var( --color-surface, #fff )',
						} }
					>
						<Icon icon={ PREVIEW_ICON.pdf } size={ 32 } />
						<PlaceholderLine width="80%" />
						<PlaceholderLine width="100%" />
						<PlaceholderLine width="100%" />
						<PlaceholderLine width="90%" />
						<PlaceholderLine width="60%" />
						<Text variant="muted" size={ 12 }>
							{ __( 'PDF preview placeholder' ) }
						</Text>
					</VStack>
				</div>
			);
		case 'doc':
		default:
			return (
				<VStack
					spacing={ 4 }
					style={ {
						padding: '24px',
						borderRadius: '4px',
						border: FRAME_BORDER,
						background: 'var( --color-surface, transparent )',
					} }
				>
					<Text size={ 15 }>{ resource.description }</Text>
					<VStack spacing={ 2 }>
						<PlaceholderLine width="100%" />
						<PlaceholderLine width="96%" />
						<PlaceholderLine width="98%" />
						<PlaceholderLine width="70%" />
					</VStack>
					<VStack spacing={ 2 }>
						<PlaceholderLine width="92%" />
						<PlaceholderLine width="100%" />
						<PlaceholderLine width="55%" />
					</VStack>
					<Text variant="muted" size={ 12 }>
						{ __( 'Rendered article placeholder' ) }
					</Text>
				</VStack>
			);
	}
}

interface BrowseResourcePreviewModalProps {
	resource: PrototypeResource;
	onClose: () => void;
}

export default function BrowseResourcePreviewModal( {
	resource,
	onClose,
}: BrowseResourcePreviewModalProps ) {
	return (
		<Modal title={ resource.title } onRequestClose={ onClose } size="large">
			<VStack spacing={ 5 }>
				<VStack spacing={ 3 }>
					<HStack spacing={ 2 } justify="flex-start" wrap>
						<Text weight={ 500 }>{ resource.product }</Text>
						<Badge>{ resource.contentType }</Badge>
						<Badge intent="info">{ AUDIENCE_LABELS[ resource.audience ] }</Badge>
					</HStack>
					<Text variant="muted">{ resource.description }</Text>
				</VStack>

				<PreviewArea resource={ resource } />

				<HStack justify="flex-end" spacing={ 3 }>
					<Button variant="tertiary" onClick={ onClose }>
						{ __( 'Close' ) }
					</Button>
					<Button variant="secondary" icon={ download }>
						{ __( 'Download' ) }
					</Button>
				</HStack>
			</VStack>
		</Modal>
	);
}
