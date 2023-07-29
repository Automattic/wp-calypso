import { useIsEnglishLocale } from '@automattic/i18n-utils';
import { useI18n } from '@wordpress/react-i18n';
import { StepContainer } from 'calypso/../packages/onboarding/src';
import FormattedHeader from 'calypso/components/formatted-header';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { usePresalesChat } from 'calypso/lib/presales-chat';
import IntroStep from './intro';
import type { Step } from '../../types';

import './styles.scss';

const Intro: Step = function Intro( { navigation, variantSlug } ) {
	const { submit } = navigation;
	const { __, hasTranslation } = useI18n();
	const isEnglishLocale = useIsEnglishLocale();

	const getHeaderText = () => {
		if ( variantSlug === 'google-transfer' ) {
			return isEnglishLocale || hasTranslation( 'Transfer your Google Domains' )
				? __( 'Transfer your Google domains' )
				: __( 'Transfer your domains' );
		}

		return isEnglishLocale || hasTranslation( 'Transfer your domains' )
			? __( 'Transfer your domains' )
			: __( 'Transfer Your Domains' );
	};

	const getSubHeaderText = () => {
		if ( variantSlug === 'google-transfer' ) {
			return isEnglishLocale ||
				hasTranslation(
					'Follow these three simple steps to transfer your Google domains to WordPress.com.'
				)
				? __( 'Follow these three simple steps to transfer your Google domains to WordPress.com.' )
				: __( 'Follow these three simple steps to transfer your domains to WordPress.com.' );
		}

		return __( 'Follow these three simple steps to transfer your domains to WordPress.com.' );
	};

	usePresalesChat( 'wpcom' );

	const handleSubmit = () => {
		submit?.();
	};
	return (
		<StepContainer
			hideBack
			stepName="intro"
			isLargeSkipLayout={ false }
			formattedHeader={
				<FormattedHeader
					id="domain-transfer-header"
					headerText={ getHeaderText() }
					subHeaderText={ getSubHeaderText() }
				/>
			}
			stepContent={ <IntroStep onSubmit={ handleSubmit } variantSlug={ variantSlug } /> }
			recordTracksEvent={ recordTracksEvent }
			showHeaderJetpackPowered={ false }
			showHeaderWooCommercePowered={ false }
			showVideoPressPowered={ false }
			showJetpackPowered={ false }
		/>
	);
};

export default Intro;
