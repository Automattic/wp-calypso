import { useI18n } from '@wordpress/react-i18n';
import { StepContainer } from 'calypso/../packages/onboarding/src';
import headerImage from 'calypso/assets/images/onboarding/import-1.svg';
import FormattedHeader from 'calypso/components/formatted-header';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import IntroStep from './intro';
import type { Step } from '../../types';

import './styles.scss';

const Intro: Step = function Intro( { navigation } ) {
	const { submit } = navigation;
	const { __ } = useI18n();

	const handleSubmit = () => {
		submit?.();
	};
	return (
		<StepContainer
			hideBack
			stepName="intro"
			isHorizontalLayout
			headerImageUrl={ headerImage }
			isLargeSkipLayout={ false }
			formattedHeader={
				<FormattedHeader
					id="bulk-domains-header"
					headerText={ __( 'Transfer your domains to WordPress.com' ) }
					align="left"
				/>
			}
			stepContent={ <IntroStep onSubmit={ handleSubmit } /> }
			recordTracksEvent={ recordTracksEvent }
			showHeaderJetpackPowered={ false }
			showHeaderWooCommercePowered={ false }
			showVideoPressPowered={ false }
		/>
	);
};

export default Intro;
