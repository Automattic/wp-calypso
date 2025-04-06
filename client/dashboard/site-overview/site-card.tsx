import { Badge } from '@automattic/components';
import {
	__experimentalVStack as VStack,
	__experimentalHeading as Heading,
	Card,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import type { Site } from '../data/types';

interface SiteCardProps {
	title: string;
	domain: string;
	status: 'active' | 'inactive' | 'maintenance';
	previewImageUrl?: string;
}

/**
 * SiteCard component to display site information in a card format
 */
export default function SiteCard( { site }: { site: Site } ) {
	const { status, title, domain, options: { software_version } = {}, url } = site;
	const previewImageUrl = `https://s0.wp.com/mshots/v1/${ encodeURIComponent( url ) }?w=350&h=200`;

	const getStatusLabel = ( status: SiteCardProps[ 'status' ] ) => {
		switch ( status ) {
			case 'active':
				return __( 'Active' );
			case 'inactive':
				return __( 'Inactive' );
			case 'maintenance':
				return __( 'Maintenance' );
			default:
				return status;
		}
	};

	const getStatusVariant = ( status: SiteCardProps[ 'status' ] ) => {
		switch ( status ) {
			case 'active':
				return 'success';
			case 'inactive':
				return 'info';
			case 'maintenance':
				return 'warning';
			default:
				return 'info';
		}
	};

	return (
		<Card>
			<VStack style={ { padding: '16px' } }>
				{ previewImageUrl && (
					<div style={ { marginBottom: '16px', borderRadius: '4px', overflow: 'hidden' } }>
						<img
							src={ previewImageUrl }
							alt={ __( 'Site preview' ) }
							style={ { width: '100%', height: 'auto', display: 'block' } }
						/>
					</div>
				) }

				<Heading level={ 3 }>{ title }</Heading>

				<div style={ { marginTop: '8px', color: '#757575', fontSize: '14px' } }>{ domain }</div>

				<div style={ { marginTop: '16px' } }>
					<Badge variant={ getStatusVariant( status ) }>{ getStatusLabel( status ) }</Badge>
				</div>
				<p>
					{ __( 'WordPress Version:' ) } { software_version }
				</p>
				<p>{ __( 'PHP Version:' ) }</p>
				<p>{ __( 'Theme: Blockbase' ) }</p>
			</VStack>
		</Card>
	);
}
