import { Button, FormLabel, Gridicon } from '@automattic/components';
import styled from '@emotion/styled';
import { Icon, check } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useState, FormEvent, ChangeEvent } from 'react';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormTextInput from 'calypso/components/forms/form-text-input';
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

const NonWPUserExplanation = styled( FormSettingExplanation )( {
	a: {
		color: 'var(--studio-gray-50)',
		textDecoration: 'underline',
		'&:hover': {
			color: 'var(--studio-gray-80)',
		},
	},
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

	const { checkSiteTransferEligibility, isPending: isCheckingSiteTransferEligibility } =
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
		checkSiteTransferEligibility( { newSiteOwner: tempSiteOwner } );
	};

	function onRecipientChange( recipient: string ) {
		const value = recipient.trim();
		setTempSiteOwner( value );
	}
	const recipientError = false;

	return (
		<form onSubmit={ handleFormSubmit }>
			<FormText>
				{ translate(
					'Transfer the ownership of {{strong}}%(siteSlug)s{{/strong}} and related purchases to another user by adding their Email or their WordPress.com Usernamei in the following form.',
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
					placeholder={ translate( 'my-client@example.com' ) }
					onChange={ ( e: ChangeEvent< HTMLInputElement > ) => {
						onRecipientChange( e.target.value );
					} }
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
				<NonWPUserExplanation>
					{ translate(
						"If the person you want to transfer ownership doesn't have a WordPress.com account yet they will be invited to create one."
					) }
				</NonWPUserExplanation>
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
