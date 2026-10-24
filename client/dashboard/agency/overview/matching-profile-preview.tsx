import { Button, __experimentalHStack as HStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { info } from '@wordpress/icons';
import { addQueryArgs } from '@wordpress/url';
import OverviewCard from '../../components/overview-card';

export default function MatchingProfilePreview( { href }: { href: string } ) {
	// Calypso flags use a literal plus as an enable prefix, rather than a space.
	const searchParams = new URLSearchParams( window.location.search.replace( /\+/g, '%2B' ) );
	const previewHref = addQueryArgs( href, {
		flags: [ searchParams.get( 'flags' ), 'a4a-lead-matching-design-preview' ]
			.filter( Boolean )
			.join( ',' ),
	} );

	return (
		<OverviewCard
			icon={ info }
			title={ __( 'Lead matching' ) }
			heading={ <span>{ __( 'Complete your matching profile' ) }</span> }
			description={ __(
				'Tell us about the clients and projects your agency works best with so we can find suitable leads.'
			) }
			bottom={
				<HStack justify="flex-start">
					<Button __next40pxDefaultSize variant="primary" href={ previewHref }>
						{ __( 'Complete profile' ) }
					</Button>
				</HStack>
			}
		/>
	);
}
