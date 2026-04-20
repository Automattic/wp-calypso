import {
	sitePurchasesQuery,
	siteCurrentUserQuery,
	siteUserDeleteMutation,
} from '@automattic/api-queries';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import {
	__experimentalText as Text,
	__experimentalVStack as VStack,
	Button,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { DataForm } from '@wordpress/dataviews';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useState } from 'react';
import { useAnalytics } from '../../app/analytics';
import { useAuth } from '../../app/auth';
import { purchasesRoute } from '../../app/router/me';
import { ButtonStack } from '../../components/button-stack';
import RouterLinkButton from '../../components/router-link-button';
import { isDashboardBackport } from '../../utils/is-dashboard-backport';
import type { Site, User } from '@automattic/api-core';

interface ContentInfoProps {
	site: Site;
	onClose: () => void;
}

type SiteLeaveFormData = {
	confirmed: boolean;
};

function isSiteOwner( user: User, site: Site ) {
	return user.ID === site.site_owner;
}

function ContentHasPurchasesCancelable( { site, onClose }: ContentInfoProps ) {
	const { recordTracksEvent } = useAnalytics();

	const managePurchasesButtonProps = {
		__next40pxDefaultSize: true,
		text: __( 'Manage purchases' ),
		variant: 'primary' as const,
		onClick: () => {
			recordTracksEvent( 'calypso_dashboard_site_leave_modal_manage_purchases_click' );
		},
	};

	return (
		<>
			<VStack spacing={ 0 }>
				<Text>
					{ __(
						'You have active subscriptions associated with this site. These must be cancelled before you can leave the site.'
					) }
				</Text>
			</VStack>
			<ButtonStack justify="flex-end" expanded={ false }>
				<Button __next40pxDefaultSize variant="tertiary" onClick={ onClose }>
					{ __( 'Cancel' ) }
				</Button>
				{ isDashboardBackport() ? (
					<Button
						{ ...managePurchasesButtonProps }
						href={ `/purchases/subscriptions/${ site.slug }` }
					/>
				) : (
					<RouterLinkButton
						{ ...managePurchasesButtonProps }
						to={ purchasesRoute.fullPath }
						search={ { site: site.ID } }
					/>
				) }
			</ButtonStack>
		</>
	);
}

function ContentSiteOwner( { site, onClose }: ContentInfoProps ) {
	const { recordTracksEvent } = useAnalytics();

	return (
		<>
			<VStack spacing={ 0 }>
				<Text>
					{ __(
						'You are the owner of this site. To leave you must first transfer ownership to another account.'
					) }
				</Text>
			</VStack>
			<ButtonStack justify="flex-end" expanded={ false }>
				<Button __next40pxDefaultSize variant="tertiary" onClick={ onClose }>
					{ __( 'Cancel' ) }
				</Button>
				<RouterLinkButton
					__next40pxDefaultSize
					variant="primary"
					to={ `/sites/${ site.slug }/settings/transfer-site` }
					onClick={ () =>
						recordTracksEvent( 'calypso_sites_dashboard_site_leave_modal_transfer_ownership_click' )
					}
				>
					{ __( 'Transfer ownership' ) }
				</RouterLinkButton>
			</ButtonStack>
		</>
	);
}

function ContentLeaveSite( { site, onClose }: ContentInfoProps ) {
	const router = useRouter();
	const { recordTracksEvent } = useAnalytics();
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );

	// It gets external user ID (ID of user entity from site connected via Jetpack) from provided WPCOM user ID.
	const { data: me } = useQuery( siteCurrentUserQuery( site.ID ) );
	const mutation = useMutation( siteUserDeleteMutation( site.ID ) );

	const [ formData, setFormData ] = useState< SiteLeaveFormData >( {
		confirmed: false,
	} );

	const isConfirmed = formData.confirmed;

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();
		if ( ! me || ! isConfirmed ) {
			return;
		}

		recordTracksEvent( 'calypso_sites_dashboard_site_leave_modal_leave_site_click' );

		mutation.mutate( me.id, {
			onSuccess: () => {
				recordTracksEvent( 'calypso_sites_dashboard_site_leave_modal_leave_site_success' );
				createSuccessNotice(
					/* translators: %s: site domain */
					sprintf( __( 'You have left %s successfully.' ), site.slug ),
					{ type: 'snackbar' }
				);

				router.navigate( { to: '/sites' } );
				onClose();
			},
			onError: ( error: Error ) => {
				recordTracksEvent( 'calypso_sites_dashboard_site_leave_modal_leave_site_error', {
					site_id: site.ID,
					error: error.name,
				} );

				createErrorNotice( error.message, { type: 'snackbar' } );
				onClose();
			},
		} );
	};

	return (
		<form onSubmit={ handleSubmit }>
			<VStack spacing={ 6 }>
				<Text as="p">
					{ createInterpolateElement(
						/* translators: <siteDomain />: site domain */
						__( 'Are you sure to leave the site <siteDomain />?' ),
						{
							siteDomain: <strong>{ site.slug }</strong>,
						}
					) }
				</Text>
				<Text as="p">
					{ __(
						'Leaving will remove your access to the site, including all content, users, domains, upgrades, and anything else you have access to.'
					) }
				</Text>
				<Text as="p">
					{ __(
						'To regain access, a current administrator must re-invite you. Please confirm this is your intent before proceeding.'
					) }
				</Text>
				<DataForm< SiteLeaveFormData >
					data={ formData }
					fields={ [
						{
							id: 'confirmed',
							label: __( 'I understand the consequences of leaving' ),
							Edit: 'checkbox',
						},
					] }
					form={ { layout: { type: 'regular' as const }, fields: [ 'confirmed' ] } }
					onChange={ ( edits: Partial< SiteLeaveFormData > ) => {
						setFormData( ( data ) => ( { ...data, ...edits } ) );
					} }
				/>
				<ButtonStack justify="flex-end" expanded={ false }>
					<Button __next40pxDefaultSize variant="tertiary" onClick={ onClose }>
						{ __( 'Cancel' ) }
					</Button>
					<Button
						__next40pxDefaultSize
						variant="primary"
						type="submit"
						disabled={ ! isConfirmed }
						isBusy={ mutation.isPending }
					>
						{ __( 'Leave site' ) }
					</Button>
				</ButtonStack>
			</VStack>
		</form>
	);
}

export default function ContentInfo( { site, onClose }: ContentInfoProps ) {
	const { user } = useAuth();
	const { data: hasPurchasesCancelable, isLoading: isLoadingHasPurchasesCancelable } = useQuery( {
		...sitePurchasesQuery( site.ID ),
		select: ( purchases ) =>
			purchases.some(
				( purchase ) =>
					purchase.user_id === user.ID &&
					( purchase.is_refundable || purchase.product_slug !== 'premium_theme' )
			),
	} );

	if ( isLoadingHasPurchasesCancelable ) {
		return null;
	}

	const renderContent = () => {
		if ( hasPurchasesCancelable ) {
			return <ContentHasPurchasesCancelable site={ site } onClose={ onClose } />;
		}

		if ( isSiteOwner( user, site ) ) {
			return <ContentSiteOwner site={ site } onClose={ onClose } />;
		}

		return <ContentLeaveSite site={ site } onClose={ onClose } />;
	};

	return <VStack spacing={ 6 }>{ renderContent() }</VStack>;
}
