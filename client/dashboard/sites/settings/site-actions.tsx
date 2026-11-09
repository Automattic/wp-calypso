import { sitePlanSoftwareRestoreMutation } from '@automattic/api-queries';
import { useHasEnTranslation } from '@automattic/i18n-utils';
import { useMutation } from '@tanstack/react-query';
import { __experimentalVStack as VStack, Button, Modal } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';
import { useState } from 'react';
import { useAuth } from '../../app/auth';
import { withSnackbar } from '../../app/snackbars/with-snackbar';
import { ActionList } from '../../components/action-list';
import { ButtonStack } from '../../components/button-stack';
import { SectionHeader } from '../../components/section-header';
import { Text } from '../../components/text';
import { wpcomLink } from '../../utils/link';
import { canViewSiteActions, canDuplicateSite } from '../features';
import type { Site } from '@automattic/api-core';

const RestorePlanSoftware = ( { site }: { site: Site } ) => {
	const [ isRestoreModalOpen, setIsRestoreModalOpen ] = useState( false );
	const hasEnTranslation = useHasEnTranslation();
	const mutation = useMutation(
		withSnackbar( sitePlanSoftwareRestoreMutation( site.ID ), {
			success: __( 'Requested restoration of plugins and themes that come with your plan.' ),
			error: __( 'Failed to request restoration of plan plugin and themes.' ),
		} )
	);

	const handleConfirm = () => {
		mutation.mutate( undefined, { onSettled: () => setIsRestoreModalOpen( false ) } );
	};

	return (
		<>
			<ActionList.ActionItem
				title={ __( 'Re-install plugins & themes' ) }
				description={
					hasEnTranslation(
						'Install any missing plugins and themes that come with your plan, and activate the plugins included with it.'
					)
						? __(
								'Install any missing plugins and themes that come with your plan, and activate the plugins included with it.'
							)
						: __(
								'If your website is missing plugins and themes that come with your plan you can re-install them here.'
							)
				}
				actions={
					<Button
						variant="secondary"
						size="compact"
						onClick={ () => setIsRestoreModalOpen( true ) }
					>
						{ __( 'Restore' ) }
					</Button>
				}
			/>
			{ isRestoreModalOpen && (
				<Modal
					title={ __( 'Restore plugins and themes?' ) }
					size="medium"
					onRequestClose={ () => setIsRestoreModalOpen( false ) }
				>
					<VStack spacing={ 6 }>
						<Text>
							{ __(
								'This installs any plugins and themes that come with your plan but are missing from your site. Plugins included with your plan will also be activated, even if you deactivated them. Your active theme won’t change, and nothing will be deleted.'
							) }
						</Text>
						<ButtonStack justify="flex-end">
							<Button
								__next40pxDefaultSize
								variant="tertiary"
								disabled={ mutation.isPending }
								onClick={ () => setIsRestoreModalOpen( false ) }
							>
								{ __( 'Cancel' ) }
							</Button>
							<Button
								__next40pxDefaultSize
								variant="primary"
								isBusy={ mutation.isPending }
								disabled={ mutation.isPending }
								onClick={ handleConfirm }
							>
								{ __( 'Restore' ) }
							</Button>
						</ButtonStack>
					</VStack>
				</Modal>
			) }
		</>
	);
};

const DuplicateSite = ( { site }: { site: Site } ) => {
	return (
		<ActionList.ActionItem
			title={ __( 'Duplicate site' ) }
			description={ __( 'Create a duplicate of this site.' ) }
			actions={
				<Button
					variant="secondary"
					size="compact"
					href={ addQueryArgs( wpcomLink( '/setup/copy-site' ), {
						sourceSlug: site.slug,
					} ) }
				>
					{ __( 'Duplicate' ) }
				</Button>
			}
		/>
	);
};

export default function SiteActions( { site }: { site: Site } ) {
	const { user } = useAuth();

	if ( ! canViewSiteActions( site ) ) {
		return null;
	}

	const actions = [
		site.is_wpcom_atomic && <RestorePlanSoftware key="restore-plan-software" site={ site } />,
		canDuplicateSite( site, user ) && <DuplicateSite key="duplicate-site" site={ site } />,
	].filter( Boolean );

	if ( ! actions.length ) {
		return null;
	}

	return (
		<VStack spacing={ 3 }>
			<SectionHeader title={ __( 'Actions' ) } level={ 3 } />
			<ActionList>{ actions }</ActionList>
		</VStack>
	);
}
