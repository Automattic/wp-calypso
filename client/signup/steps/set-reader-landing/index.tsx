import { useEffect } from 'react';
import { connect } from 'react-redux';
import { savePreference } from 'calypso/state/preferences/actions';
import { READER_AS_LANDING_PAGE_PREFERENCE } from 'calypso/state/sites/selectors/has-reader-as-landing-page';

interface Props {
	submitSignupStep: ( args: { stepName: string } ) => void;
	saveReaderPreference: () => void;
	goToNextStep: () => void;
}

const SetReaderLanding = ( {
	submitSignupStep,
	saveReaderPreference,
	goToNextStep,
}: Props ): null => {
	useEffect( () => {
		saveReaderPreference();
		submitSignupStep( { stepName: 'set-reader-landing' } );
		goToNextStep();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	return null; // Non-interactive step.
};

export default connect( null, {
	saveReaderPreference: () =>
		savePreference( READER_AS_LANDING_PAGE_PREFERENCE, {
			useReaderAsLandingPage: true,
			updatedAt: Date.now(),
		} ),
} )( SetReaderLanding );
