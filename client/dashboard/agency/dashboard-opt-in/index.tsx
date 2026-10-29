import {
	Button,
	Modal,
	TextareaControl,
	ToggleControl,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useEffect, useState } from 'react';
import { ButtonStack } from '../../components/button-stack';
import { Card, CardBody } from '../../components/card';
import { Notice } from '../../components/notice';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { SectionHeader } from '../../components/section-header';
import { Text } from '../../components/text';
import {
	OPT_IN_STEPS,
	previewUrl,
	setOptInPreview,
	useOptInPreview,
} from '../opt-in-preview/store';

const BACK_IN_CLASSIC = OPT_IN_STEPS.find( ( step ) => step.id === 'back' )!;

/**
 * Agency > Dashboard: which dashboard the whole agency uses. Only the owner can change it,
 * and switching back asks first, since it moves everyone on the team.
 */
export default function AgencyDashboardOptIn() {
	const preview = useOptInPreview();
	const { createSuccessNotice } = useDispatch( noticesStore );
	const [ reason, setReason ] = useState( '' );
	// Lets review captures find the toggle once the page is on screen.
	const [ isReady, setIsReady ] = useState( false );
	useEffect( () => {
		const timer = setTimeout( () => setIsReady( true ), 1500 );
		return () => clearTimeout( timer );
	}, [] );

	if ( ! preview ) {
		return null;
	}

	const isOwner = preview.role === 'owner';
	const isEnabled = preview.agency !== 'not-opted-in';
	const isConfirmOpen = preview.overlay === 'switch-back' && isOwner && isEnabled;
	const previousDashboardUrl = previewUrl( 'classic', BACK_IN_CLASSIC.path, {
		...BACK_IN_CLASSIC.state,
		role: preview.role,
	} );

	const handleToggle = ( enabled: boolean ) => {
		if ( enabled ) {
			setOptInPreview( { agency: 'opted-in', overlay: null } );
			createSuccessNotice( __( 'New dashboard turned on.' ), { type: 'snackbar' } );
			return;
		}
		setOptInPreview( { overlay: 'switch-back' } );
	};

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					title={ __( 'Dashboard' ) }
					description={ __( 'Choose which dashboard your agency uses.' ) }
				/>
			}
		>
			<VStack spacing={ 4 }>
				<Card>
					<CardBody>
						<VStack spacing={ 4 } alignment="flex-start">
							<SectionHeader
								level={ 3 }
								title={ __( 'New dashboard' ) }
								description={ __(
									'The new dashboard brings your sites, purchases, and earnings together. Everyone on your team uses the dashboard you choose.'
								) }
							/>
							<ToggleControl
								__nextHasNoMarginBottom
								className={ isReady ? 'a4a-dashboard-opt-in-ready' : undefined }
								checked={ isEnabled }
								disabled={ ! isOwner }
								label={ __( 'Use the new dashboard' ) }
								help={ isOwner ? undefined : __( 'Only the agency owner can change this.' ) }
								onChange={ handleToggle }
							/>
						</VStack>
					</CardBody>
				</Card>
				{ ! isEnabled && (
					<Notice
						variant="info"
						title={ __( 'Prefer the previous dashboard?' ) }
						actions={
							<Button variant="primary" __next40pxDefaultSize href={ previousDashboardUrl }>
								{ __( 'Go to the previous dashboard' ) }
							</Button>
						}
					>
						{ __(
							'Your team will use the previous dashboard until you turn the new one back on.'
						) }
					</Notice>
				) }
			</VStack>
			{ isConfirmOpen && (
				<Modal
					title={ __( 'Switch to the previous dashboard?' ) }
					size="medium"
					onRequestClose={ () => setOptInPreview( { overlay: null } ) }
				>
					<VStack spacing={ 6 }>
						<Text>
							{ __(
								'Your whole team will use the previous dashboard. You can turn the new one back on here at any time.'
							) }
						</Text>
						<TextareaControl
							__nextHasNoMarginBottom
							label={ __( 'What made you switch back?' ) }
							placeholder={ __( 'Optional' ) }
							value={ reason }
							onChange={ setReason }
							rows={ 3 }
						/>
						<ButtonStack justify="flex-end">
							<Button
								__next40pxDefaultSize
								variant="tertiary"
								onClick={ () => setOptInPreview( { overlay: null } ) }
							>
								{ __( 'Cancel' ) }
							</Button>
							<Button __next40pxDefaultSize variant="primary" href={ previousDashboardUrl }>
								{ __( 'Switch to the previous dashboard' ) }
							</Button>
						</ButtonStack>
					</VStack>
				</Modal>
			) }
		</PageLayout>
	);
}
