import {
	Button,
	SelectControl,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';
import { useState } from 'react';
import OverviewCard from '../../components/overview-card';

export default function MatchingProfilePreview( { href }: { href: string } ) {
	const [ completion, setCompletion ] = useState< 'incomplete' | 'complete' | 'unknown' >(
		'incomplete'
	);
	// Calypso flags use a literal plus as an enable prefix, rather than a space.
	const searchParams = new URLSearchParams( window.location.search.replace( /\+/g, '%2B' ) );
	const previewHref = addQueryArgs( href, {
		flags: [ searchParams.get( 'flags' ), 'a4a-lead-matching-design-preview' ]
			.filter( Boolean )
			.join( ',' ),
	} );

	return (
		<VStack spacing={ 4 }>
			<SelectControl
				__next40pxDefaultSize
				__nextHasNoMarginBottom
				label={ __( 'Design preview: profile completion' ) }
				help={ __( 'Mock state only. This does not change your saved profile.' ) }
				value={ completion }
				options={ [
					{ label: __( 'Incomplete' ), value: 'incomplete' },
					{ label: __( 'Complete' ), value: 'complete' },
					{ label: __( 'Unknown' ), value: 'unknown' },
				] }
				onChange={ setCompletion }
			/>
			{ completion === 'incomplete' && (
				<OverviewCard
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
			) }
		</VStack>
	);
}
