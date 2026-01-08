import { userSettingsMutation } from '@automattic/api-queries';
import { isEnabled } from '@automattic/calypso-config';
import { useMutation } from '@tanstack/react-query';
import {
	Button,
	ExternalLink,
	TextareaControl,
	BaseControl,
	__experimentalText as Text,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { DataForm, useFormValidity } from '@wordpress/dataviews';
import { createInterpolateElement, useMemo } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useState } from 'react';
import { isValidUrl } from '../../../lib/importer/url-validation';
import { NavigationBlocker } from '../../app/navigation-blocker';
import { Card, CardBody } from '../../components/card';
import { SectionHeader } from '../../components/section-header';
import EditGravatar from './edit-gravatar';
import GravatarLogo from './gravatar-logo';
import type { UserSettings } from '@automattic/api-core';
import type { Field, Form } from '@wordpress/dataviews';

import './style.scss';

interface GravatarProfileSectionProps {
	profile: UserSettings;
}

const fields: Field< UserSettings >[] = [
	{
		id: 'avatar_URL',
		label: __( 'Avatar' ),
		type: 'text',
		Edit: ( { field, data, hideLabelFromVision } ) => {
			return (
				<BaseControl
					label={ field.label }
					hideLabelFromVision={ hideLabelFromVision }
					__nextHasNoMarginBottom
				>
					<EditGravatar avatarUrl={ data.avatar_URL } userEmail={ data.user_email } />
				</BaseControl>
			);
		},
	},
	{
		id: 'display_name',
		label: __( 'Display name' ),
		type: 'text',
		isValid: {
			custom: ( item ) => {
				const value = item.display_name;
				if ( value && value.length > 250 ) {
					return __( 'Display name must be 250 characters or less.' );
				}
				return null;
			},
		},
	},
	{
		id: 'user_URL',
		label: __( 'Web address' ),
		type: 'text',
		isValid: {
			custom: ( item ) => {
				const value = item.user_URL?.trim();
				if ( value && ! isValidUrl( value ) ) {
					return __( 'Please enter a valid URL.' );
				}
				return null;
			},
		},
	},
	{
		id: 'description',
		label: __( 'About me' ),
		type: 'text',
		Edit: ( { field, data, onChange, hideLabelFromVision } ) => (
			<TextareaControl
				__nextHasNoMarginBottom
				label={ hideLabelFromVision ? '' : field.label }
				value={ data.description }
				onChange={ ( value: string ) => onChange( { description: value } ) }
			/>
		),
	},
];

const form: Form = {
	layout: { type: 'regular' as const, labelPosition: 'top' as const },
	fields: [ 'avatar_URL', 'display_name', 'user_URL', 'description' ],
};

const formRedesign: Form = {
	layout: { type: 'regular' as const, labelPosition: 'top' as const },
	fields: [ 'display_name', 'user_URL', 'description' ],
};

// Derive controlled keys from fields, excluding avatar_URL since it's not editable
const controlledKeys = fields
	.filter( ( field ) => field.id !== 'avatar_URL' )
	.map( ( field ) => field.id );

export default function GravatarProfileSection( {
	profile: serverProfile,
}: GravatarProfileSectionProps ) {
	const [ edits, setEdits ] = useState< Partial< UserSettings > >( {} );
	const data = useMemo( () => ( { ...serverProfile, ...edits } ), [ serverProfile, edits ] );
	const mutation = useMutation( userSettingsMutation() );
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const isSaving = mutation.isPending;
	const isDirty = controlledKeys.some(
		( key ) => data[ key as keyof UserSettings ] !== serverProfile[ key as keyof UserSettings ]
	);
	const { validity, isValid } = useFormValidity( data, fields, form );

	const onChange = ( partial: Partial< UserSettings > ) => {
		setEdits( ( current ) => ( { ...current, ...partial } ) );
	};

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();

		if ( ! edits || Object.keys( edits ).length === 0 ) {
			return;
		}

		if ( ! isValid ) {
			return;
		}

		mutation.mutate( edits, {
			onSuccess: () => {
				setEdits( {} );
				createSuccessNotice( __( 'Public Gravatar profile saved successfully.' ), {
					type: 'snackbar',
				} );
			},
			onError: ( error: Error ) => {
				createErrorNotice( error.message || __( 'Failed to save public Gravatar profile.' ), {
					type: 'snackbar',
				} );
			},
		} );
	};

	const isRedesignEnabled = isEnabled( 'me/profile-gravatar-redesign' );

	const sectionDescription = isRedesignEnabled
		? createInterpolateElement(
				__(
					'Your avatar is powered by Gravatar and appears across the web. <link>What is Gravatar?</link>'
				),
				{
					// @ts-expect-error children prop is injected by createInterpolateElement
					link: <ExternalLink href="https://support.gravatar.com/basic/what-is-gravatar/" />,
				}
		  )
		: createInterpolateElement(
				sprintf(
					/* translators: %1$s: User email */
					__(
						'Your WordPress profile is linked to Gravatar, making your Gravatar public by default. It might appear on other sites using Gravatar when logged in with <strong>%s</strong>. Manage your Gravatar settings on your <external>Gravatar profile</external>'
					),
					data.user_email
				),
				{
					strong: <strong />,
					// @ts-expect-error children prop is injected by createInterpolateElement
					external: <ExternalLink href="https://gravatar.com/profile" />,
				}
		  );

	return (
		<form onSubmit={ handleSubmit }>
			<Card>
				<CardBody>
					<VStack spacing={ 4 }>
						{ ! isRedesignEnabled && (
							<SectionHeader
								decoration={ <GravatarLogo /> }
								level={ 3 }
								title={ __( 'Public Gravatar profile' ) }
								description={ sectionDescription }
							/>
						) }

						{ isRedesignEnabled && (
							<div className="gravatar-profile-redesign">
								<div className="gravatar-profile-redesign__content">
									<div className="gravatar-profile-redesign__avatar-wrapper">
										<img
											className="gravatar-profile-redesign__avatar"
											src={ data.avatar_URL }
											alt=""
										/>
										<div className="gravatar-profile-redesign__logo-badge">
											<GravatarLogo size={ 16 } />
										</div>
									</div>
									<div className="gravatar-profile-redesign__text">
										<p className="gravatar-profile-redesign__description">
											{ __( 'Your avatar is powered by Gravatar and appears across the web.' ) }
										</p>
										<ExternalLink
											className="gravatar-profile-redesign__learn-more"
											href="https://support.gravatar.com/basic/what-is-gravatar/"
										>
											{ __( 'What is Gravatar?' ) }
										</ExternalLink>
									</div>
								</div>
								<EditGravatar
									avatarUrl={ data.avatar_URL }
									userEmail={ data.user_email }
									showAvatarPreview={ false }
								/>
							</div>
						) }

						<NavigationBlocker shouldBlock={ isDirty } />
						<DataForm< UserSettings >
							data={ data }
							fields={ fields }
							validity={ validity }
							form={ isRedesignEnabled ? formRedesign : form }
							onChange={ onChange }
						/>

						{ mutation.error && <Text>{ ( mutation.error as Error ).message }</Text> }

						<HStack justify="flex-start">
							<Button
								variant="primary"
								type="submit"
								isBusy={ isSaving }
								disabled={ isSaving || ! isDirty || ! isValid }
							>
								{ __( 'Save' ) }
							</Button>
						</HStack>
					</VStack>
				</CardBody>
			</Card>
		</form>
	);
}
