import { useEffect } from 'react';
import { useDispatch } from 'calypso/state';
import { savePreference } from 'calypso/state/preferences/actions';
import { READER_AS_LANDING_PAGE_PREFERENCE } from 'calypso/state/sites/selectors/has-reader-as-landing-page';

interface Props {
	submitSignupStep: ( args: { stepName: string } ) => void;
	goToNextStep: () => void;
}

const SetReaderLanding = ( { submitSignupStep, goToNextStep }: Props ): null => {
	const dispatch = useDispatch();

	useEffect( () => {
		dispatch(
			savePreference( READER_AS_LANDING_PAGE_PREFERENCE, {
				useReaderAsLandingPage: true,
				updatedAt: Date.now(),
			} )
		);
		submitSignupStep( { stepName: 'set-reader-landing' } );
		goToNextStep();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	return null; // Non-interactive step.
};

export default SetReaderLanding;
