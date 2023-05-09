import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { JetpackWelcomePage } from '../jetpack-welcome-page';
import { Step1 } from './Step1';
import { Step2 } from './Step2';

import './style.scss';

const JetpackFreeWelcome: React.FC = () => {
	const translate = useTranslate();

	const steps = useMemo( () => [ <Step1 />, <Step2 /> ], [] );

	return (
		<JetpackWelcomePage
			description={ translate( "Here's how to get started with Jetpack." ) }
			mainClassName="jetpack-free-welcome"
			pageViewTracker={
				<PageViewTracker
					path="/pricing/jetpack-free/welcome"
					title="Pricing > Jetpack Free > Welcome to Jetpack"
				/>
			}
			title={
				<>
					{ translate( 'Welcome{{br/}} to Jetpack!', {
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

export default JetpackFreeWelcome;
