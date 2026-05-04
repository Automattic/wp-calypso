import {
	ToggleControl,
	__experimentalHStack as HStack,
	__experimentalSpacer as Spacer,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useCallback } from 'react';
import TextPlaceholder from 'calypso/a8c-for-agencies/components/text-placeholder';
import useFetchMcpSettings from 'calypso/a8c-for-agencies/data/mcp-ai/use-fetch-mcp-settings';
import useUpdateMcpSettingsMutation from 'calypso/a8c-for-agencies/data/mcp-ai/use-update-mcp-settings-mutation';
import { Card, CardBody } from 'calypso/dashboard/components/card';
import { preventWidows } from 'calypso/lib/formatting';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { errorNotice } from 'calypso/state/notices/actions';

import '../style.scss';

export default function AiMcpAvailableToolsContent() {
	const dispatch = useDispatch();

	const { data: settings } = useFetchMcpSettings();

	const mutation = useUpdateMcpSettingsMutation( {
		onError: () => {
			dispatch( errorNotice( __( 'Could not save. Please try again.' ) ) );
		},
	} );

	const onToggleAbility = useCallback(
		( abilityName: string, next: boolean ) => {
			dispatch(
				recordTracksEvent( 'calypso_a4a_ai_mcp_ability_toggled', {
					ability_name: abilityName,
					enabled: next,
				} )
			);
			mutation.mutate( { abilities: { [ abilityName ]: next } } );
		},
		[ dispatch, mutation ]
	);

	const abilities = settings?.available_abilities ?? [];

	return (
		<>
			<Spacer className="a4a-ai-mcp-overview__intro" marginBottom={ 12 }>
				<Text size={ 15 }>
					{ preventWidows(
						__( 'Control which AI tools are available to your external AI assistant.' )
					) }
				</Text>
			</Spacer>
			<VStack spacing={ 3 }>
				{ ! abilities.length ? (
					<Card>
						<CardBody>
							<HStack alignment="left" spacing={ 4 }>
								<ToggleControl label="" checked={ false } onChange={ () => {} } disabled />
								<VStack spacing={ 1 }>
									<TextPlaceholder style={ { width: '200px' } } />
									<TextPlaceholder style={ { width: '300px' } } />
								</VStack>
							</HStack>
						</CardBody>
					</Card>
				) : (
					abilities.map( ( ability ) => (
						<Card key={ ability.name }>
							<CardBody>
								<HStack alignment="left" spacing={ 4 }>
									<ToggleControl
										label=""
										checked={ ability.enabled }
										onChange={ ( next: boolean ) => onToggleAbility( ability.name, next ) }
										disabled={ mutation.isPending }
									/>
									<VStack spacing={ 1 }>
										<Text weight={ 600 } size={ 15 }>
											{ ability.title }
										</Text>
										<Text variant="muted">{ ability.description }</Text>
									</VStack>
								</HStack>
							</CardBody>
						</Card>
					) )
				) }
			</VStack>
		</>
	);
}
