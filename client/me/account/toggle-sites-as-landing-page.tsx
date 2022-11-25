import { ToggleControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useDispatch, useSelector } from 'react-redux';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { successNotice } from 'calypso/state/notices/actions';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference } from 'calypso/state/preferences/selectors';

type ToggleSitesLandingPageProps = {
	onToggle?: ( checked: boolean ) => void;
	className?: string;
};

function ToggleSitesAsLandingPage( { onToggle, className }: ToggleSitesLandingPageProps ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const useSitesAsLandingPage = useSelector(
		( state ) => getPreference( state, 'sites-landing-page' )?.useSitesAsLandingPage
	);

	async function handleToggle( isChecked: boolean ) {
		const preference = { useSitesAsLandingPage: isChecked, updatedAt: Date.now() };
		savePreference( 'sites-landing-page', preference );
		dispatch(
			recordTracksEvent( 'calypso_sites_as_landing_page_toggled', {
				sites_as_landing_page: isChecked,
			} )
		);

		await dispatch( savePreference( 'sites-landing-page', preference ) );

		dispatch(
			successNotice( translate( 'Settings saved successfully!' ), {
				id: 'sites-landing-page-save',
				duration: 10000,
			} )
		);
		onToggle?.( isChecked );
	}

	return (
		<div className={ className }>
			<ToggleControl
				checked={ !! useSitesAsLandingPage }
				onChange={ handleToggle }
				label={ translate( 'Set the sites management page as the default landing page.' ) }
			/>
		</div>
	);
}

export default ToggleSitesAsLandingPage;
