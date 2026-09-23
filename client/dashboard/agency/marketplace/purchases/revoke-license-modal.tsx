import {
	a4aFeedbackSurveyMutation,
	activeAgencyQuery,
	jetpackAgencyLicenseRevokeMutation,
} from '@automattic/api-queries';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
	Button,
	CheckboxControl,
	TextareaControl,
	__experimentalHeading as Heading,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useEffect, useId, useState } from 'react';
import { useAnalytics } from '../../../app/analytics';
import { withSnackbar } from '../../../app/snackbars/with-snackbar';
import { ButtonStack } from '../../../components/button-stack';
import { Card, CardBody } from '../../../components/card';
import { useScheduleCall } from '../../tiers/use-schedule-call';
import { getChurnReasons } from './churn-reasons';
import HostingPlanLoss from './hosting-plan-loss';
import {
	getLicenseProductName,
	getLicenseStatus,
	getSiteHostname,
	isBundleParent,
	isChildLicense,
	isPressableLicense,
	isWpcomHostingLicense,
} from './license-status';
import type { JetpackLicense } from '@automattic/api-core';

interface Props {
	license: JetpackLicense;
	closeModal?: () => void;
}

export default function RevokeLicenseModal( { license, closeModal }: Props ) {
	const { recordTracksEvent } = useAnalytics();
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const { data: agency } = useQuery( activeAgencyQuery() );
	const revoke = useMutation( jetpackAgencyLicenseRevokeMutation( agency?.id ) );
	// The modal closes as soon as the revoke lands, so the snackbar has to live
	// on the mutation rather than on the mutate() call.
	const { mutate: fileChurnSurvey } = useMutation(
		withSnackbar( a4aFeedbackSurveyMutation(), {
			error: __( "We couldn't send your feedback, but the license was revoked." ),
		} )
	);
	const { scheduleCall, isLoading: isFetchingScheduleCallLink } = useScheduleCall( agency?.id );

	const isBundle = isBundleParent( license );
	const isAssignedChild = isChildLicense( license ) && getLicenseStatus( license ) === 'assigned';
	const isHostingLicense = isPressableLicense( license ) || isWpcomHostingLicense( license );
	const surveyId = isHostingLicense ? 'license-cancel-hosting' : 'license-cancel-product';
	const [ isPressableConfirmStep, setIsPressableConfirmStep ] = useState( false );
	const [ reasons, setReasons ] = useState< string[] >( [] );
	const [ comments, setComments ] = useState( '' );
	const reasonsLabelId = useId();

	useEffect( () => {
		recordTracksEvent( 'calypso_a4a_license_list_revoke_dialog_open' );
	}, [ recordTracksEvent ] );

	const toggleReason = ( value: string ) =>
		setReasons( ( current ) =>
			current.includes( value )
				? current.filter( ( item ) => item !== value )
				: [ ...current, value ]
		);

	const submitChurnSurvey = () => {
		if ( ! agency?.id ) {
			return;
		}
		const productName = getLicenseProductName( license );
		const licenseType = license.referral ? 'client' : 'agency';
		const suggestions = reasons.join( ', ' );
		recordTracksEvent( 'calypso_a4a_churn_feedback_submit', {
			agency_id: agency.id,
			survey_id: surveyId,
			comment: comments,
			suggestions,
			cta: 'cancel',
			product: productName,
			type: licenseType,
		} );
		fileChurnSurvey( {
			site_id: agency.id,
			survey_id: surveyId,
			survey_responses: {
				comment: { text: comments },
				suggestions: { text: suggestions },
				cta: 'cancel',
				meta: {
					product_name: productName,
					license_key: license.license_key,
					license_type: licenseType,
				},
			},
		} );
	};

	const handleSpeakWithManager = async () => {
		recordTracksEvent( 'calypso_a4a_churn_feedback_cta_click', {
			agency_id: agency?.id,
			survey_id: surveyId,
			cta: 'speak-with-partner-manager',
		} );
		await scheduleCall();
		closeModal?.();
	};

	const handleRevoke = () => {
		// Classic only asks a second time for the Pressable plan itself.
		if ( license.license_key.startsWith( 'pressable-' ) && ! isPressableConfirmStep ) {
			setIsPressableConfirmStep( true );
			return;
		}
		recordTracksEvent( 'calypso_a4a_license_list_revoke_dialog_revoke' );
		recordTracksEvent( 'calypso_a4a_churn_feedback_cta_click', {
			agency_id: agency?.id,
			survey_id: surveyId,
			cta: 'cancel',
		} );
		revoke.mutate( license.license_key, {
			onSuccess: () => {
				// Only a revoke that went through counts as churn.
				submitChurnSurvey();
				createSuccessNotice(
					isBundle ? __( 'The bundle has been revoked.' ) : __( 'The license has been revoked.' ),
					{ type: 'snackbar' }
				);
				closeModal?.();
			},
			onError: ( error: Error ) =>
				createErrorNotice(
					error.message || __( 'Failed to revoke the license. Please try again.' ),
					{ type: 'snackbar' }
				),
		} );
	};

	if ( isPressableConfirmStep ) {
		return (
			<VStack spacing={ 6 }>
				<Heading level={ 2 } size={ 15 } weight={ 500 }>
					{ __( 'Are you sure you want to revoke your Pressable plan?' ) }
				</Heading>
				<Text>
					{ __(
						'If you continue to revoke, you will lose access to all of your Pressable sites. Are you sure you want to proceed?'
					) }
				</Text>
				<ButtonStack justify="flex-end">
					<Button
						__next40pxDefaultSize
						variant="tertiary"
						onClick={ () => setIsPressableConfirmStep( false ) }
						disabled={ revoke.isPending }
					>
						{ __( 'Go back' ) }
					</Button>
					<Button
						__next40pxDefaultSize
						variant="primary"
						isDestructive
						isBusy={ revoke.isPending }
						disabled={ revoke.isPending }
						onClick={ handleRevoke }
					>
						{ __( 'Revoke Pressable plan license' ) }
					</Button>
				</ButtonStack>
			</VStack>
		);
	}

	const getRevokeMessage = () => {
		if ( isBundle ) {
			return createInterpolateElement(
				__(
					'Revoking this bundle will cause <productName /> to stop working on your <count /> assigned sites.'
				),
				{
					productName: <strong>{ getLicenseProductName( license ) }</strong>,
					count: <>{ license.quantity ?? 0 }</>,
				}
			);
		}
		if ( isAssignedChild ) {
			return createInterpolateElement(
				__(
					'This license will be revoked from <siteUrl />, and a new <productName /> license will be created and added to the bundle.'
				),
				{
					siteUrl: <strong>{ getSiteHostname( license.siteurl ?? '' ) }</strong>,
					productName: <strong>{ getLicenseProductName( license ) }</strong>,
				}
			);
		}
		return __(
			'A revoked license cannot be reused, and the associated site will no longer have access to the provisioned product. You will stop being billed for this license immediately.'
		);
	};

	return (
		<VStack spacing={ 6 }>
			<Text>{ getRevokeMessage() }</Text>
			<Card>
				<CardBody>
					<VStack spacing={ 2 }>
						{ license.siteurl && (
							<Text>
								<strong>{ __( 'Site:' ) }</strong> { getSiteHostname( license.siteurl ) }
							</Text>
						) }
						<Text>
							<strong>{ __( 'Product:' ) }</strong> { getLicenseProductName( license ) }
						</Text>
						<Text>
							<strong>{ __( 'License:' ) }</strong>{ ' ' }
							<code style={ { wordBreak: 'break-all' } }>{ license.license_key }</code>
						</Text>
					</VStack>
				</CardBody>
			</Card>
			<Text variant="muted">{ __( 'Please note this action cannot be undone.' ) }</Text>
			<VStack spacing={ 2 } role="group" aria-labelledby={ reasonsLabelId }>
				<Text id={ reasonsLabelId } weight={ 500 }>
					{ sprintf(
						// translators: %s is the name of the product being revoked.
						__( "Can you tell us why %s didn't meet your needs?" ),
						getLicenseProductName( license )
					) }
				</Text>
				{ getChurnReasons().map( ( reason ) => (
					<CheckboxControl
						key={ reason.value }
						__nextHasNoMarginBottom
						label={ reason.label }
						checked={ reasons.includes( reason.value ) }
						onChange={ () => toggleReason( reason.value ) }
						disabled={ revoke.isPending }
					/>
				) ) }
			</VStack>
			<TextareaControl
				__nextHasNoMarginBottom
				label={ __( 'Anything else we should know?' ) }
				placeholder={ __( 'Enter the issues you encountered' ) }
				value={ comments }
				onChange={ setComments }
				disabled={ revoke.isPending }
			/>
			{ isHostingLicense && <HostingPlanLoss license={ license } /> }
			<ButtonStack justify="flex-end">
				<Button
					__next40pxDefaultSize
					variant="secondary"
					isBusy={ isFetchingScheduleCallLink }
					disabled={ isFetchingScheduleCallLink || revoke.isPending }
					onClick={ handleSpeakWithManager }
				>
					{ __( 'Speak with my Partner Manager' ) }
				</Button>
				<Button
					__next40pxDefaultSize
					variant="primary"
					isDestructive
					isBusy={ revoke.isPending }
					disabled={ revoke.isPending || reasons.length === 0 }
					onClick={ handleRevoke }
				>
					{ isBundle ? __( 'Revoke bundle' ) : __( 'Revoke license' ) }
				</Button>
			</ButtonStack>
		</VStack>
	);
}
