import { useEffect } from 'react';
import { useDispatch } from 'calypso/state';
import { savePreference } from 'calypso/state/preferences/actions';
import { READER_AS_LANDING_PAGE_PREFERENCE } from 'calypso/state/sites/selectors/has-reader-as-landing-page';

interface Props {
	submitSignupStep: ( args: { stepName: string } ) => void;
	goToNextStep: () => void;
	initialContext?: {
		query?: {
			ref?: string;
		};
	};
}

const SetReaderLanding = ( { submitSignupStep, goToNextStep, initialContext }: Props ): null => {
	const dispatch = useDispatch();
	const refParam = initialContext?.query?.ref;

	useEffect( () => {
		// Submit the step immediately to trigger the processing screen.
		submitSignupStep( { stepName: 'set-reader-landing' } );

		const saveAndProceed = async () => {
			// Save the preference
			if ( 'reader-lp' === refParam ) {
				await dispatch(
					savePreference( READER_AS_LANDING_PAGE_PREFERENCE, {
						useReaderAsLandingPage: true,
						updatedAt: Date.now(),
					} )
				);
			}

			goToNextStep();
		};

		saveAndProceed();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	return null; // Non-interactive step.
};

export default SetReaderLanding;
