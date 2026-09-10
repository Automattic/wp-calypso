import { userPreferenceMutation, userPreferenceQuery } from '@automattic/api-queries';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { Button, RadioControl, __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { useAnalytics } from '../../../app/analytics';
import { withSnackbar } from '../../../app/snackbars/with-snackbar';
import { ButtonStack } from '../../../components/button-stack';
import { Card, CardBody } from '../../../components/card';
import { SectionHeader } from '../../../components/section-header';
import type { NotificationsLayoutStyle } from '@automattic/api-core';

export const PanelCard = () => {
	const { recordTracksEvent } = useAnalytics();
	const { data: savedLayoutStyle } = useSuspenseQuery(
		userPreferenceQuery( 'notifications-layout-style' )
	);
	const { mutate: saveLayoutStyle, isPending } = useMutation(
		withSnackbar( userPreferenceMutation( 'notifications-layout-style' ), {
			success: __( 'Settings saved.' ),
			error: { source: 'server' },
		} )
	);

	// Re-seed when the saved value changes under us, so the form never edits a stale value.
	const [ savedSeed, setSavedSeed ] = useState( savedLayoutStyle );
	const [ layoutStyle, setLayoutStyle ] = useState< NotificationsLayoutStyle >( savedLayoutStyle );

	if ( savedSeed !== savedLayoutStyle ) {
		setSavedSeed( savedLayoutStyle );
		setLayoutStyle( savedLayoutStyle );
	}

	const handleSubmit = ( event: React.FormEvent ) => {
		event.preventDefault();

		recordTracksEvent( 'calypso_dashboard_notifications_layout_style_updated', {
			layout_style: layoutStyle,
			previous_layout_style: savedLayoutStyle,
		} );

		saveLayoutStyle( layoutStyle );
	};

	return (
		<Card>
			<CardBody>
				<form onSubmit={ handleSubmit } aria-labelledby="notifications-panel-heading">
					<VStack spacing={ 4 }>
						<SectionHeader
							level={ 3 }
							headingId="notifications-panel-heading"
							title={ __( 'Panel' ) }
							description={ __( 'How much detail each notification shows in the list.' ) }
						/>
						<RadioControl
							label={ __( 'Panel layout style' ) }
							hideLabelFromVision
							selected={ layoutStyle }
							onChange={ ( value ) => setLayoutStyle( value as NotificationsLayoutStyle ) }
							options={ [
								{
									label: __( 'Classic' ),
									value: 'classic',
									description: __(
										'Each notification is spelled out in a full sentence of natural language.'
									),
								},
								{
									label: __( 'Simplified' ),
									value: 'simplified',
									description: __(
										'Fewer words, with icons and visual cues carrying more of the meaning.'
									),
								},
							] }
						/>
						<ButtonStack justify="flex-start">
							<Button
								variant="primary"
								type="submit"
								isBusy={ isPending }
								disabled={ isPending || layoutStyle === savedLayoutStyle }
							>
								{ __( 'Save' ) }
							</Button>
						</ButtonStack>
					</VStack>
				</form>
			</CardBody>
		</Card>
	);
};
