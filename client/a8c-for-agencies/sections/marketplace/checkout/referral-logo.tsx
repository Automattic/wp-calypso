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
import { useDispatch, useSelector } from 'calypso/state';
import { getActiveAgency } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

export type ReferralLogoChoice = {
	option: 'profile' | 'different' | 'none' | null;
	logoUrl: string | null;
	file: File | null;
};

interface Props {
	onChange?: ( choice: ReferralLogoChoice ) => void;
}

export default function ReferralLogo( { onChange }: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const agency = useSelector( getActiveAgency );
	const profileLogoUrl = agency?.profile?.company_details?.logo_url || null;
	const agencyReferralsLogoUrl = agency?.referrals_logo || null;
	const hasProfileLogo = !! profileLogoUrl;
	const hasAgencyReferralsLogo = !! agencyReferralsLogoUrl;

	// Determine initial option: prefer profile logo, then agency referrals logo, then none
	const getInitialLogoOption = (): 'profile' | 'different' | 'none' => {
		if ( hasProfileLogo ) {
			return 'profile';
		}
		if ( hasAgencyReferralsLogo ) {
			return 'different';
		}
		return 'none';
	};

	const [ logoOption, setLogoOption ] = useState< 'profile' | 'different' | 'none' | null >(
		getInitialLogoOption()
	);
	const [ selectedLogoFile, setSelectedLogoFile ] = useState< File | null >( null );
	const [ logoPreviewUrl, setLogoPreviewUrl ] = useState< string | null >( null );

	// Generate a local preview URL for selected files (object URL). Logo is uploaded when
	// referral is created (Send to client / Copy referral link).
	useEffect( () => {
		if ( ! selectedLogoFile ) {
			setLogoPreviewUrl( null );
			return;
		}
		const url = URL.createObjectURL( selectedLogoFile );
		setLogoPreviewUrl( url );
		return () => URL.revokeObjectURL( url );
	}, [ selectedLogoFile ] );

	// Keep parent state in sync for default/derived transitions (e.g. initial
	// profile-logo selection) that do not go through local change handlers.
	useEffect( () => {
		if ( ! onChange ) {
			return;
		}

		onChange( {
			option: logoOption,
			// Only send logoUrl when "different" is chosen; omit for profile logo.
			logoUrl: logoOption === 'different' ? logoPreviewUrl ?? agencyReferralsLogoUrl : null,
			file: logoOption === 'different' ? selectedLogoFile : null,
		} );
	}, [ logoOption, logoPreviewUrl, agencyReferralsLogoUrl, onChange, selectedLogoFile ] );

	let differentLogoLabel = translate( 'Upload my logo' );
	if ( hasProfileLogo ) {
		differentLogoLabel = translate( 'Use a different logo for this referral' );
	} else if ( hasAgencyReferralsLogo ) {
		differentLogoLabel = translate( 'Use this logo' );
	}

	return (
		<VStack spacing={ 2 } className="checkout__logo-section">
			<FormLabel style={ { marginBottom: 0 } } htmlFor="logo">
				{ translate( 'Your logo (Optional)' ) }
			</FormLabel>
			<Text as="p" variant="muted">
				{ translate( 'Builds trust and shows this referral comes from you.' ) }
			</Text>
			<VStack spacing={ 3 }>
				<RadioControl
					selected={ logoOption ?? undefined }
					options={ [
						...( hasProfileLogo
							? [ { label: translate( 'Use profile logo' ), value: 'profile' } ]
							: [] ),
						{
							label: differentLogoLabel,
							value: 'different',
						},
						{
							label: translate( 'Send without logo' ),
							value: 'none',
						},
					] }
					onChange={ ( value ) => {
						const option = ( value as 'profile' | 'different' | 'none' ) || null;
						if ( option ) {
							dispatch(
								recordTracksEvent( 'calypso_a4a_client_referral_logo_option_click', {
									option,
								} )
							);
						}
						setLogoOption( option );
					} }
				/>
				{ logoOption === 'profile' && profileLogoUrl && (
					<>
						<Spacer marginTop={ 3 } />
						<div className="checkout__profile-logo-preview">
							<img src={ profileLogoUrl } alt={ translate( 'Profile logo preview' ) } />
						</div>
					</>
				) }
				{ logoOption === 'different' && (
					<>
						<Spacer marginTop={ 3 } />
						<LogoFileUpload
							displayUrl={ logoPreviewUrl ?? agencyReferralsLogoUrl }
							onFileSelect={ setSelectedLogoFile }
						/>
					</>
				) }
			</VStack>
		</VStack>
	);
}
