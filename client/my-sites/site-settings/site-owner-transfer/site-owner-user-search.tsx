import { Button, FormLabel, Gridicon } from '@automattic/components';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { useState, FormEvent } from 'react';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormSelect from 'calypso/components/forms/form-select';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import { useSelector } from 'calypso/state';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { ChooseUserLoadingPlaceholder } from './choose-user-loading-placeholder';
import { User, useAdministrators } from './use-administrators';
import { useCheckSiteTransferEligibility } from './use-check-site-transfer-eligibility';

const Strong = styled( 'strong' )( {
	fontWeight: 500,
} );

const FormText = styled( 'p' )( {
	fontSize: '14px',
} );

const ButtonStyled = styled( Button )( {
	marginBottom: '1.5em',
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

const AdministratorsExplanation = styled( FormSettingExplanation )( {
	a: {
		color: 'var(--studio-gray-50)',
		textDecoration: 'underline',
		'&:hover': {
			color: 'var(--studio-gray-80)',
		},
	},
} );

function NoAdministrators( { href, siteSlug }: { href: string; siteSlug: string } ) {
	const translate = useTranslate();
	return (
		<>
			<p>
				{ translate(
					'To transfer ownership of {{strong}}%(siteSlug)s{{/strong}} to another user, first add them as an administrator of the site.',
					{
						args: { siteSlug },
						components: { strong: <Strong /> },
					}
				) }
			</p>
			<ButtonStyled primary type="submit" href={ href }>
				{ translate( 'Manage team members' ) }
			</ButtonStyled>
		</>
	);
}

const SiteOwnerTransferEligibility = ( {
	siteId,
	siteSlug,
	onNewUserOwnerSubmit,
}: {
	siteId: number;
	siteSlug: string;
	onNewUserOwnerSubmit: ( user: User ) => void;
} ) => {
	const translate = useTranslate();
	const [ tempSiteOwner, setTempSiteOwner ] = useState< User >();
	const [ siteTransferEligibilityError, setSiteTransferEligibilityError ] = useState( '' );

	const { checkSiteTransferEligibility, isLoading: isCheckingSiteTransferEligibility } =
		useCheckSiteTransferEligibility( siteId, {
			onMutate: () => {
				setSiteTransferEligibilityError( '' );
			},
			onError: ( e ) => {
				setSiteTransferEligibilityError( e.message );
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
		checkSiteTransferEligibility( { newSiteOwner: tempSiteOwner.email } );
	};

	const addUsersHref = '/people/team/' + siteSlug;
	const currentUser = useSelector( getCurrentUser );
	const { administrators, isLoading } = useAdministrators( {
		siteId,
		excludeUserEmails: [ currentUser?.email as string ],
	} );

	if ( isLoading ) {
		return <ChooseUserLoadingPlaceholder />;
	}

	if ( ! administrators || administrators.length === 0 ) {
		return <NoAdministrators href={ addUsersHref } siteSlug={ siteSlug } />;
	}

	return (
		<form onSubmit={ handleFormSubmit }>
			<FormText>
				{ translate(
					'Please, select the administrator you want to transfer ownership of {{strong}}%(siteSlug)s{{/strong}} to:',
					{
						args: { siteSlug },
						components: { strong: <Strong /> },
					}
				) }
			</FormText>

			<FormFieldset>
				<FormLabel>{ translate( 'Administrator' ) }</FormLabel>
				<FormSelect
					onChange={ ( event: React.ChangeEvent< HTMLSelectElement > ) => {
						const user = administrators.find( ( user ) => user.email === event.target.value );
						setTempSiteOwner( user );
					} }
					value={ tempSiteOwner?.email }
				>
					<option value="">{ translate( 'Select administrator' ) }</option>
					{ administrators.map( ( user ) => (
						<option key={ user.ID } value={ user.email }>
							{ `${ user.login } (${ user.email })` }
						</option>
					) ) }
				</FormSelect>
				{ siteTransferEligibilityError && (
					<Error>
						<Gridicon icon="notice-outline" size={ 16 } />
						<ErrorText>{ siteTransferEligibilityError }</ErrorText>
					</Error>
				) }
				<AdministratorsExplanation>
					{ translate(
						'If you don’t see the new owner in the list, {{linkToUsers}} add them as an administrator.{{/linkToUsers}}',
						{
							components: {
								linkToUsers: <a href={ addUsersHref } />,
							},
						}
					) }
				</AdministratorsExplanation>
			</FormFieldset>

			<ButtonStyled
				busy={ isCheckingSiteTransferEligibility }
				primary
				disabled={ ! tempSiteOwner || isCheckingSiteTransferEligibility }
				type="submit"
			>
				{ translate( 'Continue' ) }
			</ButtonStyled>
		</form>
	);
};

export default SiteOwnerTransferEligibility;
