import { StepContainer } from '@automattic/onboarding';
import { useI18n } from '@wordpress/react-i18n';
import FormattedHeader from 'calypso/components/formatted-header';
import { usePluginAutoInstallation } from 'calypso/landing/stepper/hooks/use-plugin-auto-installation';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { Step } from '../../types';
import './style.scss';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';

const BundleInstallByGoal: Step = ( { navigation } ) => {
	const { goBack } = navigation;
	const { __ } = useI18n();
	const site = useSite();

	const { status } = usePluginAutoInstallation(
		{
			slug: 'sensei',
			name: 'Sensei LMS',
		},
		site?.ID
	);

	console.log( 'SITE', site );

	return (
		<StepContainer
			stepName="bundle-confirm"
			goBack={ goBack }
			hideSkip
			isHorizontalLayout
			formattedHeader={
				<FormattedHeader
					id="bundle-confirm-title-header"
					headerText={ __( 'Install plugins' ) }
					subHeaderText={ __( 'Install plugins to create your course goal' ) }
					align="left"
				/>
			}
			stepContent={ <div>Hello</div> }
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default BundleInstallByGoal;
