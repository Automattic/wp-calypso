import { Button, Icon, __experimentalVStack as VStack } from '@wordpress/components';
import { DataForm } from '@wordpress/dataviews';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { trash } from '@wordpress/icons';
import { useState } from 'react';
import { ButtonStack } from '../../../components/button-stack';
import Notice from '../../../components/notice';
import { Text } from '../../../components/text';
import type { Threat } from '@automattic/api-core';
import type { Field } from '@wordpress/dataviews';

type ConfirmationFormData = {
	confirmation: string;
};

interface FixThreatConfirmationProps {
	threat: Threat;
	onCancel: ( () => void ) | undefined;
	onConfirm: () => void;
	disabled?: boolean;
	isLoading?: boolean;
}

export function FixThreatConfirmation( {
	threat,
	onCancel,
	onConfirm,
	disabled = false,
	isLoading = false,
}: FixThreatConfirmationProps ) {
	const [ formData, setFormData ] = useState< ConfirmationFormData >( { confirmation: '' } );

	const slug = threat.extension?.slug || 'unknown-slug';
	const isConfirmed = formData.confirmation === slug;
	const shouldBeDisabled = disabled || isLoading || ! isConfirmed;

	const fields: Field< ConfirmationFormData >[] = [
		{
			id: 'confirmation',
			label: __( 'Confirmation' ),
			type: 'text',
		},
	];

	const form = {
		layout: { type: 'regular' as const },
		fields: [ 'confirmation' ],
	};

	return (
		<VStack spacing={ 4 }>
			{ threat.fixable?.extensionStatus === 'active' ? (
				<Notice variant="error">
					{ threat.extension?.type === 'plugin' &&
						__(
							'This plugin seems to be currently active on your site. Deleting it may break your site. Please disable it first and check if your site is still working as expected, then proceed with the fix.'
						) }
					{ threat.extension?.type === 'theme' &&
						__(
							'This theme seems to be currently active on your site. Deleting it may break your site. Please disable it first and check if your site is still working as expected, then proceed with the fix.'
						) }
				</Notice>
			) : (
				<Notice variant="warning">
					{ threat.extension?.type === 'plugin' &&
						__(
							'This plugin seems to not currently be active on your site. Please note that deleting it may still have adverse effects and this action cannot be undone.'
						) }
					{ threat.extension?.type === 'theme' &&
						__(
							'This theme seems to not currently be active on your site. Please note that deleting it may still have adverse effects and this action cannot be undone.'
						) }
				</Notice>
			) }

			{ threat.fixable?.extras?.is_dotorg === false && (
				<Text>
					{ threat.extension?.type === 'plugin' &&
						__(
							'We did not find this plugin on WordPress.org. We encourage you to create a backup of your site before fixing this threat, to keep a copy of it.'
						) }
					{ threat.extension?.type === 'theme' &&
						__(
							'We did not find this theme on WordPress.org. We encourage you to create a backup of your site before fixing this threat, to keep a copy of it.'
						) }
				</Text>
			) }

			<Text>
				{ threat.extension?.type === 'plugin' && (
					<>
						{ createInterpolateElement(
							__(
								'To confirm you have read and understood the consequences, please enter the plugin slug <pluginSlug/> in the field below.'
							),
							{
								pluginSlug: <code>{ slug }</code>,
							}
						) }
					</>
				) }
				{ threat.extension?.type === 'theme' && (
					<>
						{ createInterpolateElement(
							__(
								'To confirm you have read and understood the consequences, please enter the theme slug <themeSlug/> in the field below.'
							),
							{
								themeSlug: <code>{ slug }</code>,
							}
						) }
					</>
				) }
			</Text>

			<DataForm< ConfirmationFormData >
				data={ formData }
				fields={ fields }
				form={ form }
				onChange={ ( edits: Partial< ConfirmationFormData > ) => {
					setFormData( ( data ) => ( { ...data, ...edits } ) );
				} }
			/>

			<ButtonStack justify="flex-end">
				<Button variant="tertiary" onClick={ onCancel }>
					{ __( 'Cancel' ) }
				</Button>
				<Button
					disabled={ shouldBeDisabled }
					icon={ <Icon icon={ trash } /> }
					isBusy={ isLoading }
					isDestructive
					onClick={ onConfirm }
					variant="primary"
				>
					{ __( 'Confirm deletion' ) }
				</Button>
			</ButtonStack>
		</VStack>
	);
}
