import {
	queryClient,
	rawUserPreferencesQuery,
	userPreferenceMutation,
} from '@automattic/api-queries';
import { QueryClientProvider, useMutation, useQuery } from '@tanstack/react-query';
import {
	__experimentalHStack as HStack,
	Button,
	Card,
	CardBody,
	CardDivider,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { closeSmall } from '@wordpress/icons';
import { Fragment, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { Text } from '../../components/text';
import type { UserPreferences } from '@automattic/api-core';
import './preferences.scss';

function Preference( { name }: { name: string } ) {
	const { mutate: unsetPreference } = useMutation(
		userPreferenceMutation( name as keyof UserPreferences )
	);

	const handleClick = () => {
		unsetPreference( null as unknown as UserPreferences[ keyof UserPreferences ] );
	};

	return (
		<div>
			<HStack justify="flex-start" spacing={ 1 }>
				<Button
					icon={ closeSmall }
					size="compact"
					title={ __( 'Unset preference' ) }
					onClick={ handleClick }
				/>
				<Text>{ name }</Text>
			</HStack>
		</div>
	);
}

function PreferenceList() {
	const { data: preferences } = useQuery( rawUserPreferencesQuery() );
	const entries = useMemo(
		() => Object.entries( preferences ?? {} ).sort( ( a, b ) => a[ 0 ].localeCompare( b[ 0 ] ) ),
		[ preferences ]
	);

	return (
		<div>
			<div>{ __( 'Preferences' ) }</div>
			<Card size="xSmall" className="preferences-helper__current-preferences">
				{ entries.length > 0 ? (
					entries.map( ( [ name ], index ) => (
						<Fragment key={ name }>
							<CardBody>
								<Preference name={ name } />
							</CardBody>
							{ index < entries.length - 1 && <CardDivider /> }
						</Fragment>
					) )
				) : (
					<CardBody>
						<Text>{ __( 'No preferences' ) }</Text>
					</CardBody>
				) }
			</Card>
		</div>
	);
}

export function loadPreferencesHelper() {
	const element = document.querySelector( '.environment.is-prefs' );
	if ( element ) {
		createRoot( element ).render(
			<QueryClientProvider client={ queryClient }>
				<PreferenceList />
			</QueryClientProvider>
		);
	}
}
