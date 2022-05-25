import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import JetpackLogo from 'calypso/components/jetpack-logo';
import Main from 'calypso/components/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';

const JetpackSocialWelcome: React.FC = () => {
	const translate = useTranslate();

	return (
		<Main wideLayout className="jetpack-social-welcome">
			<PageViewTracker
				path="/pricing/jetpack-social/welcome"
				title="Pricing > Jetpack Boost > Welcome to Jetpack Boost"
			/>
			<Card className="jetpack-social-welcome__card">
				<div className="jetpack-social-welcome__card-main">
					<JetpackLogo size={ 45 } />
					<h1 className="jetpack-social-welcome__main-message">
						{ translate( 'Welcome{{br/}} to Jetpack Social!', {
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

export default JetpackSocialWelcome;
