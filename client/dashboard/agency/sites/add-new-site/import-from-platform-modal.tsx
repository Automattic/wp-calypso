import { STATIC_SITE_IMPORT_TERMINAL_STATES } from '@automattic/api-core';
import {
	activeAgencyQuery,
	createStaticSiteImportSessionMutation,
	pollStaticSiteImportSessionUntil,
	staticSiteImportSessionQuery,
} from '@automattic/api-queries';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import {
	Button,
	Modal,
	Spinner,
	TextControl,
	__experimentalVStack as VStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { useAnalytics } from '../../../app/analytics';
import { ButtonStack } from '../../../components/button-stack';
import Notice from '../../../components/notice';
import { SiteConfigurationForm } from '../../marketplace/purchases/site-configuration-modal';

/**
 * Follows one import after its dev site is created, until the server has
 * delivered it or given up.
 */
function ImportProgress( {
	sessionId,
	onStartAgain,
}: {
	sessionId: string;
	onStartAgain: () => void;
} ) {
	const { data: session, isError } = useQuery( {
		...staticSiteImportSessionQuery( sessionId ),
		refetchInterval: pollStaticSiteImportSessionUntil( STATIC_SITE_IMPORT_TERMINAL_STATES ),
	} );

	if ( isError || session?.state === 'failed' ) {
		return (
			<VStack spacing={ 4 }>
				<Notice variant="error" title={ __( 'We couldn’t move this site' ) }>
					{ __(
						'Your development site was created, but the import did not finish. Start again with the address to try once more.'
					) }
				</Notice>
				<ButtonStack justify="flex-end">
					<Button __next40pxDefaultSize variant="primary" onClick={ onStartAgain }>
						{ __( 'Start again' ) }
					</Button>
				</ButtonStack>
			</VStack>
		);
	}

	if ( session?.state === 'finished' ) {
		return (
			<VStack spacing={ 4 }>
				<Notice variant="success" title={ __( 'Your site is ready to review' ) }>
					{ __(
						'The import is on your development site. Review it, then launch it when the client is ready.'
					) }
				</Notice>
				<ButtonStack justify="flex-end">
					<Link to="/sites">{ __( 'Go to Sites' ) }</Link>
					{ session.site_url && (
						<Button
							__next40pxDefaultSize
							variant="primary"
							href={ session.site_url }
							target="_blank"
							rel="noreferrer"
						>
							{ __( 'Review the site' ) }
						</Button>
					) }
				</ButtonStack>
			</VStack>
		);
	}

	return (
		<VStack spacing={ 4 }>
			<Text>
				<Spinner />
				{ __( 'Moving your site…' ) }
			</Text>
			<Text variant="muted">
				{ __(
					'We are building it on your new development site. This usually takes a few minutes. You can close this: the site is in Sites, and we email you if the move fails.'
				) }
			</Text>
		</VStack>
	);
}

/**
 * Moves a site from another platform onto a new dev site: the import starts
 * here, and the server delivers it onto the dev site once the site exists and
 * the build lands.
 */
export default function ImportFromPlatformModal( { onClose }: { onClose: () => void } ) {
	const { recordTracksEvent } = useAnalytics();
	const { data: agency } = useQuery( activeAgencyQuery() );
	const [ sourceUrl, setSourceUrl ] = useState( '' );
	const [ sessionId, setSessionId ] = useState< string >();
	const [ isCreating, setIsCreating ] = useState( false );
	const [ isSiteCreated, setIsSiteCreated ] = useState( false );
	const createSession = useMutation( createStaticSiteImportSessionMutation() );

	const startAgain = () => {
		setSessionId( undefined );
		setIsSiteCreated( false );
		createSession.reset();
	};

	const onSubmit = ( event: React.FormEvent ) => {
		event.preventDefault();
		recordTracksEvent( 'calypso_a4a_sites_import_from_platform_submit' );
		createSession.mutate( sourceUrl.trim(), {
			onSuccess: ( session ) => setSessionId( session.session_id ),
		} );
	};

	let body;
	if ( sessionId && isSiteCreated ) {
		body = <ImportProgress sessionId={ sessionId } onStartAgain={ startAgain } />;
	} else if ( sessionId && agency?.id ) {
		body = (
			<SiteConfigurationForm
				agencyId={ agency.id }
				isDevSite
				importSessionId={ sessionId }
				closeModal={ onClose }
				onCreatingChange={ setIsCreating }
				onCreated={ () => setIsSiteCreated( true ) }
			/>
		);
	} else {
		body = (
			<form onSubmit={ onSubmit }>
				<VStack spacing={ 4 }>
					<Text>
						{ __(
							'Enter the address of a Wix, Squarespace, or other non-WordPress site. We build it on a free development site you can review before you pay.'
						) }
					</Text>
					{ createSession.error && (
						<Notice variant="error">
							{ createSession.error.message || __( 'Something went wrong. Please try again.' ) }
						</Notice>
					) }
					<TextControl
						__next40pxDefaultSize
						__nextHasNoMarginBottom
						label={ __( 'Current site address' ) }
						type="url"
						required
						placeholder="https://example.com"
						value={ sourceUrl }
						disabled={ createSession.isPending }
						onChange={ setSourceUrl }
					/>
					<ButtonStack justify="flex-end">
						<Button __next40pxDefaultSize variant="tertiary" onClick={ onClose }>
							{ __( 'Cancel' ) }
						</Button>
						<Button
							__next40pxDefaultSize
							variant="primary"
							type="submit"
							isBusy={ createSession.isPending }
							disabled={ createSession.isPending }
						>
							{ __( 'Continue' ) }
						</Button>
					</ButtonStack>
				</VStack>
			</form>
		);
	}

	return (
		<Modal
			title={ __( 'Move a site from another platform' ) }
			size="medium"
			onRequestClose={ onClose }
			// Closing mid-creation unmounts the observer, so the site lands
			// server-side and nothing tracks it or says how it went.
			isDismissible={ ! isCreating }
			shouldCloseOnEsc={ ! isCreating }
			shouldCloseOnClickOutside={ ! isCreating }
		>
			{ body }
		</Modal>
	);
}
