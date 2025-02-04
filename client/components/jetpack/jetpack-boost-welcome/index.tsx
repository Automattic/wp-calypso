import { JETPACK_CONTACT_SUPPORT } from '@automattic/urls';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { JetpackWelcomePage } from '../jetpack-welcome-page';
import { Step1 } from './Step1';
import { Step2 } from './Step2';

import './style.scss';

const JetpackBoostWelcome: React.FC = () => {
	const translate = useTranslate();

	const steps = useMemo( () => [ <Step1 />, <Step2 /> ], [] );

	return (
		<JetpackWelcomePage
			description={ translate( "Here's how to get started" ) }
			footer={ translate( 'Need help? {{a}}Contact us{{/a}}.', {
				components: {
					a: <a target="_blank" rel="noopener noreferrer" href={ JETPACK_CONTACT_SUPPORT } />,
				},
			} ) }
			mainClassName="jetpack-boost-welcome"
			pageViewTracker={
				<PageViewTracker
					path="/pricing/jetpack-boost/welcome"
					title="Pricing > Jetpack Boost > Welcome to Jetpack Boost"
				/>
			}
			title={
				<>
					{ translate( 'Welcome to{{br/}} Jetpack Boost!', {
						components: {
							br: <br />,
						},
					} ) }{ ' ' }
					{ String.fromCodePoint( 0x1f389 ) /* Celebration emoji 🎉 */ }
				</>
			}
			steps={ steps }
		/>
	);
};

export default JetpackBoostWelcome;
