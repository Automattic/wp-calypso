import { DataForm } from '@automattic/dataviews';
import { useQuery, useMutation, Query } from '@tanstack/react-query';
import {
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	Button,
	ExternalLink,
	Modal,
	ProgressBar,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useEffect, useState, useCallback } from 'react';
import {
	siteResetContentSummaryQuery,
	resetSiteMutation,
	siteResetStatusQuery,
} from '../../app/queries';
import Notice from '../../components/notice';
import ContentInfo from './content-info';
import type { Site, SiteResetContentSummary, SiteResetStatus } from '../../data/types';
import type { Field } from '@automattic/dataviews';

import './style.scss';

type SiteResetFormData = {
	domain: string;
};

function ErrorContent( { message, onClose }: { message: string; onClose: () => void } ) {
	return (
		<VStack spacing={ 6 }>
			<Text>{ message }</Text>
			<HStack justify="flex-end">
				<Button variant="primary" onClick={ onClose }>
					{ __( 'OK' ) }
				</Button>
			</HStack>
		</VStack>
	);
}

function InProgressContent( { progress }: { progress: number | undefined } ) {
	const progressValue = progress ? progress * 100 : 10;
	return (
		<VStack spacing={ 4 }>
			<ProgressBar className="reset-site-modal-progress-bar" value={ progressValue } />
			<Text>{ __( "We're resetting your site. We'll email you once it's ready." ) }</Text>
		</VStack>
	);
}

function SiteResetContent( {
	siteContent,
	siteDomain,
	isBusy,
	onSubmit,
	onClose,
}: {
	site: Site;
	siteContent: SiteResetContentSummary;
	siteDomain: string;
	isBusy: boolean;
	onSubmit: () => void;
	onClose: () => void;
} ) {
	const [ formData, setFormData ] = useState< SiteResetFormData >( {
		domain: '',
	} );

	const fields: Field< SiteResetFormData >[] = [
		{
			id: 'domain',
			label: __( 'Type the site domain to confirm' ),
			type: 'text' as const,
			description: sprintf(
				/* translators: %s: site domain */
				__( 'The site domain is: %s' ),
				siteDomain
			),
		},
	];

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();
		onSubmit();
	};

	return (
		<VStack spacing={ 6 }>
			<Notice variant="warning" density="medium">
				<Text>
					{ createInterpolateElement(
						__(
							'Before resetting your site, consider <link>exporting your content as a backup</link>.'
						),
						{
							// @ts-expect-error children prop is injected by createInterpolateElement
							link: <ExternalLink href={ `/export/${ siteDomain }` } />,
						}
					) }
				</Text>
			</Notice>
			<Text as="p">
				{ createInterpolateElement(
					/* translators: <siteDomain />: site domain */
					__(
						"Resetting <siteDomain /> will remove all of its content but keep the site and its URL up and running. You'll also lose any modifications you've made to your current theme. This cannot be undone."
					),
					{
						siteDomain: <strong>{ siteDomain }</strong>,
					}
				) }
			</Text>
			<ContentInfo siteContent={ siteContent } siteDomain={ siteDomain } />

			<form onSubmit={ handleSubmit }>
				<VStack spacing={ 4 }>
					<DataForm< SiteResetFormData >
						data={ formData }
						fields={ fields }
						form={ { type: 'regular', fields } }
						onChange={ ( edits: { domain?: string } ) => {
							setFormData( ( data ) => ( {
								...data,
								...edits,
								domain: edits.domain?.trim() ?? data.domain,
							} ) );
						} }
					/>
					<HStack spacing={ 4 } justify="flex-end">
						<Button variant="tertiary" onClick={ onClose }>
							{ __( 'Cancel' ) }
						</Button>
						<Button
							variant="primary"
							type="submit"
							isBusy={ isBusy }
							disabled={ formData.domain !== siteDomain }
						>
							{ __( 'Reset site' ) }
						</Button>
					</HStack>
				</VStack>
			</form>
		</VStack>
	);
}

export default function SiteResetModal( { site, onClose }: { site: Site; onClose: () => void } ) {
	const { createSuccessNotice } = useDispatch( noticesStore );
	const [ error, setError ] = useState< string | null >( null );

	const { data: siteContentSummary } = useQuery< SiteResetContentSummary >(
		siteResetContentSummaryQuery( site.ID )
	);

	const statusQuery = {
		...siteResetStatusQuery( site.ID ),
		...( site.is_wpcom_atomic && {
			refetchInterval: ( query: Query< SiteResetStatus > ) => {
				const { data } = query.state;

				if ( data?.status === 'ready' || data?.status === 'completed' ) {
					return false;
				}
				return 5000;
			},
			gcTime: 0,
			meta: {
				persist: false,
			},
		} ),
	};

	const { data: resetStatus, refetch: refetchResetStatus } =
		useQuery< SiteResetStatus >( statusQuery );
	const { mutate, isPending: isMutationPending } = useMutation( resetSiteMutation( site.ID ) );

	const showSuccessNotice = useCallback( () => {
		createSuccessNotice(
			sprintf(
				/* translators: %s: site domain */
				__( '%s has been reset.' ),
				site.slug
			),
			{ type: 'snackbar' }
		);
	}, [ createSuccessNotice, site.slug ] );

	useEffect( () => {
		if ( resetStatus?.status === 'completed' ) {
			showSuccessNotice();
			onClose();
		}
	}, [ resetStatus?.status, showSuccessNotice, onClose ] );

	if ( ! siteContentSummary || ! resetStatus ) {
		return null;
	}

	const handleReset = () => {
		if ( isMutationPending ) {
			return;
		}

		mutate( undefined, {
			onSuccess: () => {
				if ( site.is_wpcom_atomic ) {
					refetchResetStatus();
				} else {
					showSuccessNotice();
					onClose();
				}
			},
			onError: ( error: Error ) => {
				setError(
					error.message || __( 'The site could not be reset due to an error. Please try again.' )
				);
			},
		} );
	};

	let modalConfig;

	if ( error ) {
		modalConfig = {
			title: __( 'Error resetting site' ),
			size: 'small' as const,
			content: <ErrorContent message={ error } onClose={ onClose } />,
		};
	} else if ( resetStatus?.status === 'in-progress' ) {
		modalConfig = {
			title: __( 'Resetting site' ),
			size: 'small' as const,
			content: <InProgressContent progress={ resetStatus?.progress } />,
		};
	} else {
		modalConfig = {
			title: __( 'Reset site' ),
			size: 'medium' as const,
			content: (
				<SiteResetContent
					site={ site }
					siteContent={ siteContentSummary }
					siteDomain={ site.slug }
					isBusy={ isMutationPending }
					onSubmit={ handleReset }
					onClose={ onClose }
				/>
			),
		};
	}

	return (
		<Modal
			title={ modalConfig.title }
			onRequestClose={ onClose }
			size={ modalConfig.size }
			isDismissible={ ! error && ! isMutationPending }
			shouldCloseOnClickOutside={ ! isMutationPending }
		>
			{ modalConfig.content }
		</Modal>
	);
}
