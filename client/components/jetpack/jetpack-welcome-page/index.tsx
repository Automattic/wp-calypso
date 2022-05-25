import { Card } from '@automattic/components';
import classnames from 'classnames';
import JetpackLogo from 'calypso/components/jetpack-logo';
import Main from 'calypso/components/main';

import './style.scss';

export type WelcomeStep = {
	content?: React.ReactNode;
	id?: string;
	title?: React.ReactNode;
};

export type JetpackWelcomePageProps = {
	description?: React.ReactNode;
	footer?: React.ReactNode;
	mainClassName?: string;
	pageViewTracker?: React.ReactNode;
	steps?: Array< WelcomeStep >;
	title: React.ReactNode;
};

export const JetpackWelcomePage: React.FC< JetpackWelcomePageProps > = ( {
	description,
	footer,
	mainClassName,
	pageViewTracker,
	steps,
	title,
} ) => {
	return (
		<Main wideLayout className={ classnames( 'jetpack-welcome-page', mainClassName ) }>
			{ pageViewTracker }
			<Card className="jetpack-welcome-page__card">
				<div className="jetpack-welcome-page__card--main">
					<JetpackLogo size={ 45 } />
					<h1 className="jetpack-welcome-page__title">{ title }</h1>
					<p className="jetpack-welcome-page__description">{ description }</p>
					<div className="jetpack-welcome-page__steps">
						{ steps?.map( ( { content, id, title }, index ) => {
							return (
								<div className="jetpack-welcome-page__step" key={ id || index }>
									<div className="jetpack-welcome-page__step--number">{ index + 1 }</div>
									<div className="jetpack-welcome-page__step--body">
										{ title ? (
											<h2 className="jetpack-welcome-page__step--title">{ title }</h2>
										) : null }
										<div className="jetpack-welcome-page__step--content">{ content }</div>
									</div>
								</div>
							);
						} ) }
					</div>
				</div>
				{ footer ? <div className="jetpack-welcome-page__card--footer">{ footer }</div> : null }
			</Card>
		</Main>
	);
};

export default JetpackWelcomePage;
