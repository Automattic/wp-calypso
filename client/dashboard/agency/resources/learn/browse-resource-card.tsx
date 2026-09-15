import { Badge } from '@automattic/ui';
import {
	Button,
	Icon,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import { Card, CardBody, CardMedia } from '../../../components/card';
import styles from './browse-resource-card.module.scss';
import { AUDIENCE_LABELS, PREVIEW_ICON } from './browse-resources-data';
import type { PrototypeResource } from './browse-resources-types';

interface BrowseResourceCardProps {
	resource: PrototypeResource;
	onPreview: ( resource: PrototypeResource ) => void;
}

export default function BrowseResourceCard( { resource, onPreview }: BrowseResourceCardProps ) {
	return (
		<Card
			size="small"
			className={ clsx( styles.card, resource.topResource && styles.cardFeatured ) }
		>
			<CardMedia>
				<button
					type="button"
					onClick={ () => onPreview( resource ) }
					aria-label={ resource.title }
					style={ {
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						inlineSize: '100%',
						aspectRatio: '16 / 9',
						border: 'none',
						cursor: 'pointer',
						background: 'rgba( 127, 127, 127, 0.1 )',
						color: 'var( --color-text-subtle, currentColor )',
					} }
				>
					<Icon icon={ PREVIEW_ICON[ resource.previewType ] } size={ 48 } />
				</button>
			</CardMedia>
			<CardBody style={ { display: 'flex', flexDirection: 'column', flex: 1 } }>
				<VStack spacing={ 3 } style={ { marginBlockEnd: '24px' } }>
					<Text variant="muted" size={ 12 } weight={ 500 } upperCase>
						{ resource.product }
					</Text>
					<HStack spacing={ 2 } justify="flex-start" expanded={ false } wrap>
						{ resource.topResource && <Badge intent="info">{ __( 'Top resource' ) }</Badge> }
						<Badge>{ resource.contentType }</Badge>
						<Badge intent="info">{ AUDIENCE_LABELS[ resource.audience ] }</Badge>
					</HStack>
					<VStack spacing={ 1 }>
						<Text size={ 15 } weight={ 600 }>
							{ resource.title }
						</Text>
						<Text variant="muted" size={ 13 }>
							{ resource.description }
						</Text>
					</VStack>
				</VStack>
				<Button
					variant="secondary"
					onClick={ () => onPreview( resource ) }
					style={ { marginBlockStart: 'auto', alignSelf: 'flex-start' } }
				>
					{ __( 'Preview' ) }
				</Button>
			</CardBody>
		</Card>
	);
}
