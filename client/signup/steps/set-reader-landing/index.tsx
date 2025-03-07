import { useEffect } from 'react';
import wpcom from 'calypso/lib/wp';
import { USER_SETTING_KEY } from 'calypso/state/preferences/constants';
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
	const refParam = initialContext?.query?.ref;
	useEffect( () => {
		const saveAndProceed = async () => {
			if ( 'reader-lp' === refParam ) {
				const payload = {
					[ USER_SETTING_KEY ]: {
						[ READER_AS_LANDING_PAGE_PREFERENCE ]: {
							useReaderAsLandingPage: true,
							updatedAt: Date.now(),
						},
					},
				};

				// Fire PUT request directly without awaiting the response.
				wpcom.req.put( '/me/preferences', payload );
			}
			submitSignupStep( { stepName: 'set-reader-landing' } );
			goToNextStep();
		};

		saveAndProceed();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	return null; // Non-interactive step.
};

export default SetReaderLanding;
