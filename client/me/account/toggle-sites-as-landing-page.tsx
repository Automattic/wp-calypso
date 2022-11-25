import { ToggleControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useMutation, UseMutationOptions } from 'react-query';
import { useDispatch, useSelector } from 'react-redux';
import { successNotice } from 'calypso/state/notices/actions';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference } from 'calypso/state/preferences/selectors';

type ToggleSitesLandingPageProps = {
	onToggle?: ( checked: boolean ) => void;
	className?: string;
};

function useLandingPagePreferenceMutation(
	options: UseMutationOptions< void, unknown, { isChecked: boolean } > = {}
) {
	const dispatch = useDispatch();

	return useMutation( async ( { isChecked } ) => {
		await dispatch(
			savePreference( 'sites-landing-page', {
				useSitesAsLandingPage: isChecked,
				updatedAt: Date.now(),
			} )
		);
	}, options );
}

function ToggleSitesAsLandingPage( { onToggle, className }: ToggleSitesLandingPageProps ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const { mutate: saveLandingPagePreference, isLoading } = useLandingPagePreferenceMutation( {
		onSuccess: ( _, { isChecked } ) => {
			dispatch(
				successNotice( translate( 'Settings saved successfully!' ), {
					id: 'sites-landing-page-save',
					duration: 10000,
				} )
			);
			onToggle?.( isChecked );
		},
	} );

	const useSitesAsLandingPage = useSelector( ( state ) =>
		getPreference( state, 'sites-landing-page' )
	)?.useSitesAsLandingPage;

	return (
		<div className={ className }>
			<ToggleControl
				checked={ !! useSitesAsLandingPage }
				disabled={ isLoading }
				onChange={ ( isChecked ) => saveLandingPagePreference( { isChecked } ) }
				label={ translate( 'Set sites dasboard as default landing page.' ) }
			/>
		</div>
	);
}

export default ToggleSitesAsLandingPage;
