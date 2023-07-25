import { useIsEnglishLocale } from '@automattic/i18n-utils';
import { hasTranslation } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { StepContainer } from 'calypso/../packages/onboarding/src';
import FormattedHeader from 'calypso/components/formatted-header';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { usePresalesChat } from 'calypso/lib/presales-chat';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import TransferDomains from './domains';
import type { Step } from '../../types';

import './styles.scss';

const Intro: Step = function Intro( { navigation, flow } ) {
	const { submit, goBack } = navigation;
	const { __ } = useI18n();
	const isEnglishLocale = useIsEnglishLocale();

	usePresalesChat( 'wpcom' );

	const handleSubmit = () => {
		submit?.();
	};

	const getTranslatedSubHeaderText =
		hasTranslation(
			'Enter your domain names and authorization codes below. You can transfer up to fifty domains at a time.'
		) || isEnglishLocale
			? __(
					'Enter your domain names and authorization codes below. You can transfer up to fifty domains at a time.'
			  )
			: __(
					'Enter your domain names and authorization codes below. You can transfer up to 50 domains at a time.'
			  );

	return (
		<StepContainer
			flowName={ flow }
			stepName="domains"
			goBack={ goBack }
			isHorizontalLayout={ false }
			isLargeSkipLayout={ false }
			formattedHeader={
				<FormattedHeader
					id="domain-transfer-header"
					headerText={ __( 'Add your domains' ) }
					subHeaderText={
						<>
							<span>{ getTranslatedSubHeaderText }</span>
						</>
					}
					align="center"
				/>
			}
			stepContent={
				<CalypsoShoppingCartProvider>
					<TransferDomains onSubmit={ handleSubmit } />
				</CalypsoShoppingCartProvider>
			}
			recordTracksEvent={ recordTracksEvent }
			showHeaderJetpackPowered={ false }
			showHeaderWooCommercePowered={ false }
			showVideoPressPowered={ false }
			showJetpackPowered={ false }
		/>
	);
};

export default Intro;
