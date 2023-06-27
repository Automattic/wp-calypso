import { useI18n } from '@wordpress/react-i18n';
import { StepContainer } from 'calypso/../packages/onboarding/src';
import headerImage from 'calypso/assets/images/domains/transfer.svg';
import FormattedHeader from 'calypso/components/formatted-header';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import TransferDomains from './domains';
import type { Step } from '../../types';

import './styles.scss';

const Intro: Step = function Intro( { navigation, flow } ) {
	const { submit, goBack } = navigation;
	const { __ } = useI18n();

	const handleSubmit = () => {
		submit?.();
	};
	return (
		<StepContainer
			flowName={ flow }
			stepName="domains"
			goBack={ goBack }
			isHorizontalLayout
			headerImageUrl={ headerImage }
			isLargeSkipLayout={ false }
			formattedHeader={
				<FormattedHeader
					id="bulk-domains-header"
					headerText={ __( 'Give us the deets' ) }
					align="left"
				/>
			}
			stepContent={ <TransferDomains onSubmit={ handleSubmit } /> }
			recordTracksEvent={ recordTracksEvent }
			showHeaderJetpackPowered={ false }
			showHeaderWooCommercePowered={ false }
			showVideoPressPowered={ false }
		/>
	);
};

export default Intro;
