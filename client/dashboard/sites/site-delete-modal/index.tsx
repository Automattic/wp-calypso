import { DataForm } from '@automattic/dataviews';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import {
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	Button,
	ExternalLink,
	Modal,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { createInterpolateElement } from '@wordpress/element';
import { __, _n, sprintf } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useState } from 'react';
import { useAuth } from '../../app/auth';
import {
	deleteSiteMutation,
	p2HubP2sQuery,
	siteHasPurchasesCancelableQuery,
} from '../../app/queries';
import Notice from '../../components/notice';
import type { Site } from '../../data/types';
import type { Field } from '@automattic/dataviews';

type SiteDeleteFormData = {
	domain: string;
};

const canDeleteSite = ( site: Site ) =>
	( site.is_wpcom_atomic || ! site.jetpack ) && ! site.is_vip && ! site.options?.p2_hub_blog_id;

const TRIAL_PRODUCT_SLUGS = [
	'wp_bundle_migration_trial_monthly',
	'wp_bundle_hosting_trial_monthly',
	'ecommerce-trial-bundle-monthly',
];

const isTrialSite = ( site: Site ) =>
	site.plan?.product_slug && TRIAL_PRODUCT_SLUGS.includes( site.plan?.product_slug );

function SiteDeleteWarningContent( { site, onClose }: { site: Site; onClose: () => void } ) {
	const { data: p2HubP2s } = useQuery( {
		...p2HubP2sQuery( site.ID, { limit: 1 } ),
		enabled: !! site.options?.p2_hub_blog_id && site.options?.is_wpforteams_site,
	} );

	const isAtomicRemovalInProgress = site.plan?.is_free && site.is_wpcom_atomic;
	const p2HubP2Count = p2HubP2s?.totalItems ?? 0;

	const renderWarningContent = () => {
		if ( isAtomicRemovalInProgress ) {
			return __(
				"We are still in the process of removing your previous plan. Please check back in a few minutes and you'll be able to delete your site."
			);
		}

		if ( p2HubP2Count ) {
			return sprintf(
				/* translators: %d is the number of P2 in your workspace */
				_n(
					'There is %d P2 in your workspace. Please delete it prior to deleting your workspace.',
					'There are %d P2s in your workspace. Please delete them prior to deleting your workspace.',
					p2HubP2Count
				),
				p2HubP2Count
			);
		}

		if ( isTrialSite( site ) ) {
			return __(
				'You have an active or expired free trial on your site. Please cancel this plan prior to deleting your site.'
			);
		}

		return __(
			'You have active paid upgrades on your site. Please cancel your upgrades prior to deleting your site.'
		);
	};

	const renderPrimaryButton = () => {
		if ( isAtomicRemovalInProgress ) {
			return (
				<Button variant="primary" onClick={ onClose }>
					{ __( 'OK' ) }
				</Button>
			);
		}

		if ( p2HubP2Count ) {
			return (
				<Button variant="primary" href={ site.URL }>
					{ __( 'Manage P2s' ) }
				</Button>
			);
		}

		if ( isTrialSite( site ) ) {
			<Button variant="primary" href={ `/purchases/subscriptions/${ site.slug }` }>
				{ __( 'Cancel trial' ) }
			</Button>;
		}

		return (
			<Button variant="primary" href={ `/purchases/subscriptions/${ site.slug }` }>
				{ __( 'Manage purchases' ) }
			</Button>
		);
	};

	return (
		<>
			<Text as="p">{ renderWarningContent() }</Text>
			<HStack justify="flex-end">
				{ ! isAtomicRemovalInProgress && (
					<Button variant="tertiary" onClick={ onClose }>
						{ __( 'Cancel' ) }
					</Button>
				) }
				{ renderPrimaryButton() }
			</HStack>
		</>
	);
}

function SiteDeleteConfirmContent( { site, onClose }: { site: Site; onClose: () => void } ) {
	const router = useRouter();
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const [ formData, setFormData ] = useState< SiteDeleteFormData >( { domain: '' } );
	const mutation = useMutation( deleteSiteMutation( site.slug ) );

	const fields: Field< SiteDeleteFormData >[] = [
		{
			id: 'domain',
			label: __( 'Type the site domain to confirm' ),
			type: 'text' as const,
			description: sprintf(
				/* translators: %s: site domain */
				__( 'The site domain is: %s' ),
				site.slug
			),
		},
	];

	const form = {
		type: 'regular' as const,
		fields: [ 'domain' ],
	};

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();

		mutation.mutate( undefined, {
			onSuccess: () => {
				router.navigate( { to: '/sites' } );
				createSuccessNotice(
					sprintf(
						/* translators: %s: site name */
						__( '%s has been deleted.' ),
						site.slug
					),
					{ type: 'snackbar' }
				);
			},
			onError: ( error: Error ) => {
				createErrorNotice( error.message || __( 'Failed to delete site' ), {
					type: 'snackbar',
				} );
			},
		} );
	};

	return (
		<>
			<Notice variant="warning" density="medium">
				<Text>
					{ createInterpolateElement(
						'Before deleting your site, consider <link>exporting your content as a backup</link>.',
						{
							// @ts-expect-error children prop is injected by createInterpolateElement
							link: <ExternalLink href="#" />,
						}
					) }
				</Text>
			</Notice>
			<Text as="p">
				{ __(
					'Deletion is irreversible and will permanently remove all site content — posts, pages, media, users, authors, domains, purchased upgrades, and premium themes.'
				) }
			</Text>
			<Text as="p">
				{ sprintf(
					/* translators: %s: site domain */
					__( 'Once deleted, your domain %s will also become unavailable.' ),
					site.slug
				) }
			</Text>
			<form onSubmit={ handleSubmit }>
				<VStack spacing={ 4 }>
					<DataForm< SiteDeleteFormData >
						data={ formData }
						fields={ fields }
						form={ form }
						onChange={ ( edits: Partial< SiteDeleteFormData > ) => {
							setFormData( ( data ) => ( { ...data, ...edits } ) );
						} }
					/>
					<HStack justify="flex-end">
						<Button variant="tertiary" disabled={ mutation.isPending } onClick={ onClose }>
							{ __( 'Cancel' ) }
						</Button>
						<Button
							variant="primary"
							type="submit"
							isDestructive
							isBusy={ mutation.isPending }
							disabled={ formData.domain !== site.slug }
						>
							{ __( 'Delete site' ) }
						</Button>
					</HStack>
				</VStack>
			</form>
		</>
	);
}

export default function SiteDeleteModal( { site, onClose }: { site: Site; onClose: () => void } ) {
	const { user } = useAuth();
	const { isLoading, data: hasPurchasesCancelable } = useQuery(
		siteHasPurchasesCancelableQuery( site.slug, user.ID )
	);

	const canBeDeleted = canDeleteSite( site ) && ! hasPurchasesCancelable;
	const title = canBeDeleted ? __( 'Delete site' ) : __( 'Unable to delete site' );

	if ( isLoading ) {
		return null;
	}

	return (
		<Modal title={ title } size="medium" onRequestClose={ onClose }>
			<VStack spacing={ 4 }>
				{ canBeDeleted ? (
					<SiteDeleteConfirmContent site={ site } onClose={ onClose } />
				) : (
					<SiteDeleteWarningContent site={ site } onClose={ onClose } />
				) }
			</VStack>
		</Modal>
	);
}
