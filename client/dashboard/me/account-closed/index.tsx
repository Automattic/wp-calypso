import { restoreAccountMutation } from '@automattic/api-queries';
import { WordPressLogo } from '@automattic/components/src/logos/wordpress-logo';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, useSearch } from '@tanstack/react-router';
import {
	Button,
	__experimentalText as Text,
	__experimentalHeading as Heading,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';

interface SearchParams {
	token?: string;
}

export default function AccountClosed() {
	const navigate = useNavigate();
	const search = useSearch( { strict: false } ) as SearchParams;
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const [ restoreToken, setRestoreToken ] = useState< string | null >( null );
	const restoreMutation = useMutation( restoreAccountMutation() );

	// Get token from URL params or stored state
	useEffect( () => {
		if ( search.token ) {
			setRestoreToken( search.token );
		}
	}, [ search.token ] );

	const handleRestoreAccount = () => {
		if ( ! restoreToken ) {
			return;
		}

		restoreMutation.mutate( restoreToken, {
			onSuccess: () => {
				createSuccessNotice( __( 'Your account has been successfully restored!' ), {
					type: 'snackbar',
				} );
				navigate( { to: '/me/profile' } );
			},
			onError: () => {
				const errorMessage = __(
					'Sorry, there was a problem restoring your account. Please contact support.'
				);

				createErrorNotice( errorMessage, {
					type: 'snackbar',
				} );
			},
		} );
	};

	const handleCreateAccount = () => {
		window.location.href = '/start';
	};

	const onCancelClick = () => {
		window.location.href = '/';
	};

	return (
		<VStack spacing={ 0 } style={ { minHeight: '100vh' } }>
			<HStack justify="space-between" style={ { padding: '20px 24px', width: 'auto' } }>
				<WordPressLogo size={ 24 } className="dashboard-account-closed__logo" />
				<Button variant="link" onClick={ handleCreateAccount }>
					{ __( 'Create an account' ) }
				</Button>
			</HStack>
			<VStack spacing={ 12 } alignment="center" style={ { flex: 1, textAlign: 'center' } }>
				<VStack spacing={ 4 } style={ { maxWidth: '450px' } }>
					<Heading level={ 1 } weight={ 400 }>
						{ __( 'Your account has been deleted' ) }
					</Heading>
					<Text>
						{ __(
							'Thanks for flying with WordPress.com. You have 30 days to restore your account if you change your mind.'
						) }
					</Text>
				</VStack>

				<VStack alignment="center" spacing={ 4 }>
					{ restoreToken && (
						<Button
							variant="secondary"
							onClick={ handleRestoreAccount }
							isBusy={ restoreMutation.isPending }
							disabled={ restoreMutation.isPending }
						>
							{ __( 'I made a mistake! Restore my account' ) }
						</Button>
					) }

					<Button variant="link" onClick={ onCancelClick }>
						{ __( 'Return to WordPress.com' ) }
					</Button>
				</VStack>
			</VStack>
		</VStack>
	);
}
