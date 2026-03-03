import { FormLabel } from '@automattic/components';
import {
	RadioControl,
	__experimentalSpacer as Spacer,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import LogoFileUpload from 'calypso/a8c-for-agencies/components/logo-file-upload';
import { useSelector } from 'calypso/state';
import { getActiveAgency } from 'calypso/state/a8c-for-agencies/agency/selectors';

export default function ReferralLogo() {
	const translate = useTranslate();
	const agency = useSelector( getActiveAgency );
	const profileLogoUrl = agency?.profile?.company_details?.logo_url || null;
	const hasProfileLogo = !! profileLogoUrl;

	const [ logoOption, setLogoOption ] = useState< 'profile' | 'different' >(
		hasProfileLogo ? 'profile' : 'different'
	);
	const [ selectedLogoFile, setSelectedLogoFile ] = useState< File | null >( null );
	const [ logoPreviewUrl, setLogoPreviewUrl ] = useState< string | null >( null );

	useEffect( () => {
		if ( selectedLogoFile ) {
			const url = URL.createObjectURL( selectedLogoFile );
			setLogoPreviewUrl( url );
			return () => URL.revokeObjectURL( url );
		}
		setLogoPreviewUrl( null );
	}, [ selectedLogoFile ] );

	useEffect( () => {
		if ( ! hasProfileLogo ) {
			setLogoOption( 'different' );
		}
	}, [ hasProfileLogo ] );

	return (
		<VStack spacing={ 2 } className="checkout__logo-section">
			<FormLabel style={ { marginBottom: 0 } } htmlFor="logo">
				{ translate( 'Your logo' ) }
			</FormLabel>
			<Text as="p" variant="muted">
				{ translate( 'Builds trust and shows this referral comes from you.' ) }
			</Text>
			<VStack spacing={ 3 }>
				{ hasProfileLogo && (
					<VStack spacing={ 0 }>
						<RadioControl
							selected={ logoOption }
							options={ [ { label: translate( 'Use profile logo' ), value: 'profile' } ] }
							onChange={ () => setLogoOption( 'profile' ) }
						/>
						{ logoOption === 'profile' && (
							<>
								<Spacer marginTop={ 3 } />
								<div className="checkout__profile-logo-preview">
									<img src={ profileLogoUrl } alt={ translate( 'Profile logo preview' ) } />
								</div>
							</>
						) }
					</VStack>
				) }
				<VStack spacing={ 0 }>
					<RadioControl
						selected={ logoOption }
						options={ [
							{
								label: translate( 'Use a different logo for this referral' ),
								value: 'different',
							},
						] }
						onChange={ () => setLogoOption( 'different' ) }
					/>
					{ logoOption === 'different' && (
						<>
							<Spacer marginBottom={ 3 } />
							<LogoFileUpload displayUrl={ logoPreviewUrl } onFileSelect={ setSelectedLogoFile } />
						</>
					) }
				</VStack>
			</VStack>
		</VStack>
	);
}
