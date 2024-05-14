import { SiteIntent } from '@automattic/data-stores/src/onboard';
import { StepContainer } from '@automattic/onboarding';
import { Button, Icon } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { chevronRight } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import FormattedHeader from 'calypso/components/formatted-header';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { ONBOARD_STORE } from '../../../../stores';
import { useIntents } from './intents';
import type { Step } from '../../types';

import './styles.scss';

/**
 * The intent capture step - i2
 */
const IntentStep: Step = function IntentStep( { navigation } ) {
	const { submit } = navigation;
	const translate = useTranslate();

	const { setIntent } = useDispatch( ONBOARD_STORE );

	const intents = useIntents();

	const submitIntent = ( intent: SiteIntent ) => {
		const providedDependencies = { intent };
		recordTracksEvent( 'calypso_signup_intent_select', providedDependencies );
		setIntent( intent );
		submit?.( providedDependencies, intent );
	};

	const intentHeader = () => {
		return (
			<FormattedHeader
				id="intent-header"
				headerText={ translate( 'What brings you to WordPress.com?' ) }
				subHeaderText={ translate(
					'This will help us tailor your onboarding experience to your needs.'
				) }
				align="center"
				subHeaderAlign="center"
			/>
		);
	};

	const intentScreenContent = () => {
		return (
			<div className="site-intent">
				{ intents.map( ( intent ) => {
					return (
						<Button
							key={ intent.key }
							className="site-intent__item-card"
							onClick={ () => {
								submitIntent( intent.value );
							} }
						>
							<div className="site-intent__content">
								<p className="site-intent__title">{ intent.title }</p>
								<p className="site-intent__description">{ intent.description }</p>
							</div>
							<Icon size={ 24 } icon={ chevronRight } />
						</Button>
					);
				} ) }
			</div>
		);
	};

	return (
		<StepContainer
			stepName="intent-step"
			shouldHideNavButtons={ true }
			isHorizontalLayout={ false }
			formattedHeader={ intentHeader() }
			stepContent={ intentScreenContent() }
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default IntentStep;
