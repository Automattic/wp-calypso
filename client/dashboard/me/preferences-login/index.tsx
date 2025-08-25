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
import {Text} from '../../components/text';

interface LoginPreferencesData {
	enableTwoFactor: boolean;
	rememberDevice: boolean;
	requirePasswordReset: boolean;
}

export default function PreferencesLogin() {
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );

	const [preferences, setPreferences] = useState<LoginPreferencesData>({
		enableTwoFactor: false,
		rememberDevice: true,
		requirePasswordReset: false,
	});

	const [isSaving, setIsSaving] = useState(false);

	const handlePreferenceChange = (key: keyof LoginPreferencesData) => (value: boolean) => {
		setPreferences(prev => ({
			...prev,
			[key]: value
		}));
	};

	const handleSave = async () => {
		setIsSaving(true);
		try {
			// TODO: Implement actual API call to save preferences
			await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

			createSuccessNotice(__('Login preferences saved successfully.'));
		} catch (error) {
			createErrorNotice(__('Failed to save login preferences. Please try again.'));
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<Card>
			<CardBody>
				<VStack spacing={4}>
					<Text as="h3">{__('Login preferences')}</Text>
					<RadioControl
						onChange={() => null}
						options={[

						]}
					/>
					<Button
						variant="primary"
						onClick={handleSave}
						isBusy={isSaving}
						disabled={isSaving}
					>
						{ __('Save') }
					</Button>
				</VStack>
			</CardBody>
		</Card>
	);
}
