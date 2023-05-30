import { Button, Gridicon } from '@automattic/components';
import styled from '@emotion/styled';
import { TextControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState, FormEvent, useEffect } from 'react';
import { useCheckSiteTransferEligibility } from './use-check-site-transfer-eligibility';

const TextControlContainer = styled.div( {
	marginBottom: '2em',
} );

const Error = styled.div( {
	display: 'flex',
	alignItems: 'center',
	color: 'red',
} );

const ErrorText = styled.p( {
	margin: 0,
	marginLeft: '0.4em',
	fontSize: '14px',
} );

const SiteOwnerTransferEligibility = ( {
	selectedSiteId,
	selectedSiteSlug,
	siteOwner,
	onNewUserOwnerSubmit,
}: {
	selectedSiteId: number;
	selectedSiteSlug: string;
	siteOwner: string;
	onNewUserOwnerSubmit: ( user: string ) => void;
} ) => {
	const translate = useTranslate();
	const [ tempSiteOwner, setTempSiteOwner ] = useState( siteOwner );
	const [ siteTransferEligibilityError, setSiteTransferEligibilityError ] = useState( '' );

	const { checkSiteTransferEligibility, isLoading: isCheckingSiteTransferEligibility } =
		useCheckSiteTransferEligibility( selectedSiteId, {
			onMutate: () => {
				setSiteTransferEligibilityError( '' );
			},
			onError: () => {
				setSiteTransferEligibilityError( translate( 'User not found' ) );
			},
			onSuccess: () => {
				onNewUserOwnerSubmit?.( tempSiteOwner || '' );
			},
		} );

	useEffect( () => {
		setTempSiteOwner( siteOwner );
	}, [ siteOwner ] );

	const handleFormSubmit = ( event: FormEvent< HTMLFormElement > ) => {
		event.preventDefault();
		if ( ! tempSiteOwner ) {
			return;
		}
		checkSiteTransferEligibility( { newSiteOwner: tempSiteOwner } );
	};

	return (
		<form onSubmit={ handleFormSubmit }>
			<p>
				{ translate(
					'Please, enter the username or email address of the registered WordPress.com user that you want to transfer ownership of %(siteSlug)s to:',
					{
						args: { siteSlug: selectedSiteSlug },
					}
				) }
			</p>
			<TextControlContainer>
				<TextControl
					autoComplete="off"
					label={ translate( 'Username or email address' ) }
					value={ tempSiteOwner }
					onChange={ ( value ) => setTempSiteOwner( value ) }
				/>
				{ siteTransferEligibilityError && (
					<Error>
						<Gridicon icon="notice-outline" size={ 16 } />
						<ErrorText>{ siteTransferEligibilityError }</ErrorText>
					</Error>
				) }
			</TextControlContainer>
			<Button
				busy={ isCheckingSiteTransferEligibility }
				primary
				onClick={ () => {
					false;
				} }
				disabled={ ! tempSiteOwner || isCheckingSiteTransferEligibility }
				type="submit"
			>
				{ translate( 'Switch user and continue' ) }
			</Button>
		</form>
	);
};

export default SiteOwnerTransferEligibility;
