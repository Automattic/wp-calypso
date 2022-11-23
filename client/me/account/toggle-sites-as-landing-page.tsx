import { ToggleControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { successNotice } from 'calypso/state/notices/actions';
import { savePreference, setPreference } from 'calypso/state/preferences/actions';
import { getPreference } from 'calypso/state/preferences/selectors';

type ToggleSitesLandingPageProps = {
	onToggle?: ( checked: boolean ) => void;
	className?: string;
};

function ToggleSitesAsLandingPage( { onToggle, className }: ToggleSitesLandingPageProps ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const isSiteLandingPage = useSelector( ( state ) =>
		getPreference( state, 'sitesAsLandingPage' )
	);

	const [ isDisabled, setIsDisabled ] = useState( false );

	async function handleToggle( isChecked: boolean ) {
		setIsDisabled( true );
		dispatch( setPreference( 'sitesAsLandingPage', isChecked ) );
		await dispatch( savePreference( 'sitesAsLandingPage', isChecked ) );
		dispatch(
			successNotice( translate( 'Settings saved successfully!' ), {
				id: 'sites-landing-page-save',
				duration: 10000,
			} )
		);
		setIsDisabled( false );
		onToggle?.( isChecked );
	}

	return (
		<div className={ className }>
			<ToggleControl
				checked={ !! isSiteLandingPage }
				disabled={ isDisabled }
				onChange={ handleToggle }
				label={ translate( 'Set sites dasboard as default landing page.' ) }
			/>
		</div>
	);
}

export default ToggleSitesAsLandingPage;
