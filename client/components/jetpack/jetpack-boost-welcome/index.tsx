import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import JetpackLogo from 'calypso/components/jetpack-logo';
import Main from 'calypso/components/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';

const JetpackBoostWelcome: React.FC = () => {
	const translate = useTranslate();

	return (
		<Main wideLayout className="jetpack-boost-welcome">
			<PageViewTracker
				path="/pricing/jetpack-boost/welcome"
				title="Pricing > Jetpack Boost > Welcome to Jetpack Boost"
			/>
			<Card className="jetpack-boost-welcome__card">
				<div className="jetpack-boost-welcome__card-main">
					<JetpackLogo size={ 45 } />
					<h1 className="jetpack-boost-welcome__main-message">
						{ translate( 'Welcome{{br/}} to Jetpack Boost!', {
							components: {
								br: <br />,
							},
						} ) }
						&nbsp;
						{ String.fromCodePoint( 0x1f389 ) /* Celebration emoji 🎉 */ }
					</h1>
				</div>
			</Card>
		</Main>
	);
};

export default JetpackBoostWelcome;
