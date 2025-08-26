import {
	Card,
	CardBody,
	__experimentalVStack as VStack,
	Button, RadioControl,
} from '@wordpress/components';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useDispatch } from '@wordpress/data';
import { store as noticesStore } from '@wordpress/notices';
import { useQuery, useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { userPreferenceQuery, userPreferenceMutation } from '../../app/queries/me-preferences';
import {Text} from '../../components/text';

import { LandingPage } from 'calypso/dashboard/data/me-preferences';

export default function PreferencesLogin() {
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );

	// Fetch current login preferences
	const { data: loginPrefs } = useSuspenseQuery(
		userPreferenceQuery('login-preferences')
	);

	// Initialize local state from server data
	const [landingPage, setLandingPage] = useState<LandingPage>(
		(loginPrefs?.defaultLandingPage || 'primary-site-dashboard')
	);

	// Update preferences mutation
	const updatePreferences = useMutation(
		userPreferenceMutation('login-preferences')
	);

	const handleSave = async () => {
		try {
			await updatePreferences.mutateAsync({
				...loginPrefs,
				defaultLandingPage: landingPage,
			});

			createSuccessNotice(__('Login preferences saved successfully.'));
		} catch (error) {
			createErrorNotice(__('Failed to save login preferences. Please try again.'));
		}
	};

	return (
		<Card>
			<CardBody>
				<VStack spacing={4}>
					<Text as="h3">{__('Login preferences')}</Text>
					<RadioControl
						label={__('Default Landing Page')}
						selected={landingPage}
						options={[
							{ label: __('Primary site dashboard'), value: 'primary-site-dashboard' },
							{ label: __('Sites'), value: 'sites' },
							{ label: __('Reader'), value: 'reader' }
						] satisfies {label: string, value: LandingPage}[] }
						onChange={(value: string) => {
							setLandingPage(value as LandingPage);
						}}
					/>
					<Button
						variant="primary"
						onClick={handleSave}
						isBusy={updatePreferences.isPending}
						disabled={updatePreferences.isPending}
					>
						{ __('Save') }
					</Button>
				</VStack>
			</CardBody>
		</Card>
	);
}
