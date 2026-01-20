import { userSettingsMutation, userSettingsQuery } from '@automattic/api-queries';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import {
	Icon,
	ToggleControl,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { code } from '@wordpress/icons';
import { store as noticesStore } from '@wordpress/notices';
import { Card, CardBody } from '../../components/card';

export default function DeveloperModeSection() {
	const { data: userSettings } = useSuspenseQuery( userSettingsQuery() );
	const mutation = useMutation( userSettingsMutation() );
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );

	const isDevAccount = userSettings?.is_dev_account ?? false;

	const handleToggle = () => {
		const newValue = ! isDevAccount;
		mutation.mutate(
			{ is_dev_account: newValue },
			{
				onSuccess: () => {
					createSuccessNotice(
						newValue ? __( 'Developer mode enabled.' ) : __( 'Developer mode disabled.' ),
						{ type: 'snackbar' }
					);
				},
				onError: ( error: Error ) => {
					createErrorNotice(
						error.message ||
							( newValue
								? __( 'Failed to enable developer mode.' )
								: __( 'Failed to disable developer mode.' ) ),
						{ type: 'snackbar' }
					);
				},
			}
		);
	};

	return (
		<Card className="developer-mode-section">
			<CardBody>
				<HStack spacing={ 2 } alignment="flex-start">
					<span style={ { display: 'inline-flex', flexShrink: 0 } }>
						<Icon icon={ code } size={ 24 } style={ { fill: '#757575' } } />
					</span>
					<VStack spacing={ 2 } style={ { flex: 1 } }>
						<Text weight={ 500 } lineHeight="24px">
							{ __( 'Developer mode' ) }
						</Text>
						<div style={ { paddingBottom: '6px' } }>
							<ToggleControl
								__nextHasNoMarginBottom
								label={ __( 'Opt in to previews of new developer-focused features and tools.' ) }
								checked={ isDevAccount }
								onChange={ handleToggle }
								disabled={ mutation.isPending }
							/>
						</div>
					</VStack>
				</HStack>
			</CardBody>
		</Card>
	);
}
