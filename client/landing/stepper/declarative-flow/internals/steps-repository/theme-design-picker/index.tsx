/* eslint-disable wpcalypso/jsx-classname-namespace */
import { StepContainer } from '@automattic/onboarding';
import { useSelect } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
import FormattedHeader from 'calypso/components/formatted-header';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { ONBOARD_STORE } from '../../../../stores';
import type { Step } from '../../types';
import './style.scss';

const ThemeDesignPicker: Step = function ThemeDesignPicker( { navigation } ) {
	const { goBack, submit } = navigation;
	const translate = useTranslate();
	const headerText = translate( 'Set up your store', {
		components: { br: <br /> },
	} );
	const subHeaderText = translate( 'Let’s create a website that suits your needs.' );
	const { getIntent } = useSelect( ( select ) => select( ONBOARD_STORE ) );

	return (
		<StepContainer
			stepName={ 'theme-design-picker' }
			goBack={ goBack }
			skipLabelText={ translate( 'Skip to dashboard' ) }
			isHorizontalLayout={ true }
			formattedHeader={
				<FormattedHeader
					id={ 'intent-header' }
					headerText={ headerText }
					subHeaderText={ subHeaderText }
					align={ 'left' }
				/>
			}
			stepContent={ <></> }
			intent={ getIntent() }
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default ThemeDesignPicker;
