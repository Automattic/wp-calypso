import { Button, FormLabel, Gridicon } from '@automattic/components';
import styled from '@emotion/styled';
import { Icon, check } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useState, FormEvent, ChangeEvent } from 'react';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormTextInput from 'calypso/components/forms/form-text-input';
import { PanelCardHeading } from 'calypso/components/panel';
import useUsersQuery from 'calypso/data/users/use-users-query';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import TeamMembersSiteTransfer from 'calypso/my-sites/people/team-members-site-transfer';
import { isHostingMenuUntangled } from '../../../utils';
import { useCheckSiteTransferEligibility } from './use-check-site-transfer-eligibility';
import type { UsersQuery } from '@automattic/data-stores';

const Strong = styled( 'strong' )( {
	fontWeight: 500,
} );

const FormText = styled( 'p' )( {
	fontSize: '14px',
} );

const Error = styled.div( {
	display: 'flex',
	alignItems: 'center',
	color: 'red',
} );

const ErrorText = styled.p( {
	margin: 0,
	marginLeft: '0.4em',
	fontSize: '100%',
} );

const FieldExplanation = styled.p( {
	color: 'var(--studio-gray-50)',
} );

const SiteOwnerTransferEligibility = ( {
	siteId,
	siteSlug,
	onNewUserOwnerSubmit,
}: {
	siteId: number;
	siteSlug: string;
	onNewUserOwnerSubmit: ( user: string ) => void;
} ) => {
	const translate = useTranslate();
	const [ tempSiteOwner, setTempSiteOwner ] = useState< string >( '' );
	const [ siteTransferEligibilityError, setSiteTransferEligibilityError ] = useState( '' );
	const usersQuery = useUsersQuery( siteId, {
		search: `*${ tempSiteOwner }*`,
		search_columns: [ 'display_name', 'user_login', 'user_email' ],
		include_viewers: false,
	} ) as unknown as UsersQuery;
	const usersFound = ( usersQuery?.data?.users?.length ?? 0 ) > 0;

	const { checkSiteTransferEligibility, isPending: isCheckingSiteTransferEligibility } =
		useCheckSiteTransferEligibility( siteId, {
			onMutate: () => {
				setSiteTransferEligibilityError( '' );
			},
			onError: ( e ) => {
				setSiteTransferEligibilityError( e.message );
				recordTracksEvent( 'calypso_site_owner_transfer_eligibility_error', {
					message: e.message,
				} );
			},
			onSuccess: () => {
				if ( ! tempSiteOwner ) {
					return;
				}
				onNewUserOwnerSubmit?.( tempSiteOwner );
			},
		} );

	const handleFormSubmit = ( event: FormEvent< HTMLFormElement > ) => {
		event.preventDefault();
		if ( ! tempSiteOwner ) {
			return;
		}

		recordTracksEvent( 'calypso_site_owner_transfer_eligibility_submit', {
			temp_site_owner: tempSiteOwner,
		} );
		checkSiteTransferEligibility( { newSiteOwner: tempSiteOwner } );
	};

	function onUserClick( userLogin: string ) {
		onRecipientChange( userLogin );
		checkSiteTransferEligibility( { newSiteOwner: userLogin } );
	}

	function onRecipientChange( recipient: string ) {
		const value = recipient.trim();
		setTempSiteOwner( value );
	}
	const recipientError = false;

	const form = (
		<form onSubmit={ handleFormSubmit }>
			<FormText>
				{ translate(
					"Ready to transfer {{strong}}%(siteSlug)s{{/strong}} and its associated purchases? Simply enter the new owner's email or WordPress.com username below, or choose an existing user to start the transfer process.",
					{
						args: { siteSlug },
						components: { strong: <Strong /> },
					}
				) }
			</FormText>

			<FormFieldset>
				<FormLabel>{ translate( 'Email or WordPress.com username' ) }</FormLabel>
				<FormTextInput
					id="recipient"
					name="recipient"
					value={ tempSiteOwner }
					isError={ recipientError }
					placeholder="@"
					onChange={ ( e: ChangeEvent< HTMLInputElement > ) => onRecipientChange( e.target.value ) }
				/>
				{ recipientError && (
					<div className="form-validation-icon">
						<Icon icon={ check } />
					</div>
				) }
				{ siteTransferEligibilityError && (
					<Error>
						<Gridicon icon="notice-outline" size={ 16 } />
						<ErrorText>{ siteTransferEligibilityError }</ErrorText>
					</Error>
				) }
			</FormFieldset>
			{ ! usersFound && (
				<FieldExplanation>
					{ translate(
						"If the new owner isn't on WordPress.com yet, we'll guide them through a simple sign-up process."
					) }
				</FieldExplanation>
			) }

			{ tempSiteOwner && usersFound && (
				<TeamMembersSiteTransfer
					search={ tempSiteOwner }
					usersQuery={ usersQuery }
					onClick={ ( userLogin: string ) => onUserClick( userLogin ) }
				/>
			) }

			<Button
				busy={ isCheckingSiteTransferEligibility }
				primary
				disabled={ ! tempSiteOwner || isCheckingSiteTransferEligibility }
				type="submit"
			>
				{ translate( 'Continue' ) }
			</Button>
		</form>
	);

	const isUntangled = isHostingMenuUntangled();

	return (
		<>
			{ isUntangled && <PanelCardHeading>{ translate( 'Confirm new owner' ) }</PanelCardHeading> }
			{ form }
		</>
	);
};

export default SiteOwnerTransferEligibility;
