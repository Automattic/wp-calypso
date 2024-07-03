import { Card } from '@automattic/components';
import clsx from 'clsx';
import JetpackLogo from 'calypso/components/jetpack-logo';
import Main from 'calypso/components/main';

import './style.scss';

type JetpackWelcomePageProps = {
	title: React.ReactNode;
	description?: React.ReactNode;
	footer?: React.ReactNode;
	mainClassName?: string;
	pageViewTracker?: React.ReactNode;
	steps?: Array< React.ReactNode >;
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
		<Main wideLayout className={ clsx( 'jetpack-welcome-page', mainClassName ) }>
			{ pageViewTracker }
			<Card className="jetpack-welcome-page__card">
				<div className="jetpack-welcome-page__card--main">
					<JetpackLogo size={ 45 } />
					<h1 className="jetpack-welcome-page__title">{ title }</h1>
					<p className="jetpack-welcome-page__description">{ description }</p>
					<div className="jetpack-welcome-page__steps">
						{ steps?.map( ( step, index ) => {
							return (
								<div className="jetpack-welcome-page__step" key={ index }>
									<div className="jetpack-welcome-page__step--number">{ index + 1 }</div>
									<div className="jetpack-welcome-page__step--content">{ step }</div>
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
