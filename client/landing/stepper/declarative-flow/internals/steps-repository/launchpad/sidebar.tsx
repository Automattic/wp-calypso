import { useTranslate } from 'i18n-calypso';
import WordPressLogo from 'calypso/components/wordpress-logo';
import { useFlowParam } from 'calypso/landing/stepper/hooks/use-flow-param';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { useTranslateFlowName } from 'calypso/landing/stepper/hooks/use-translate-flow-name';
import Checklist from './checklist';
import { tasks } from './tasks';

const Sidebar = ( { siteSlug }: { siteSlug: string | null } ) => {
	const translate = useTranslate();
	const site = useSite();
	const url = site?.URL?.replace( /^https?:\/\//, '' );
	const flow = useFlowParam();
	const translatedFlowName = useTranslateFlowName( flow );

	return (
		<div className="launchpad__sidebar">
			<div className="launchpad__sidebar-header">
				<WordPressLogo className="launchpad__sidebar-header-logo" size={ 24 } />
				<span className="launchpad__sidebar-header-flow-name">{ translatedFlowName }</span>
			</div>
			<div className="launchpad__sidebar-content-container">
				<div className="launchpad__progress-bar-container">
					<span className="launchpad__progress-value">33%</span>
					<div className="launchpad__progress-bar">
						<div className="launchpad__progress-bar-completed" />
					</div>
				</div>
				{ /* eslint-disable-next-line wpcalypso/jsx-classname-namespace*/ }
				<h1 className="launchpad__sidebar-h1">
					{ translate( 'Voilà! Your %(translatedFlowName)s is up and running!', {
						args: { translatedFlowName },
					} ) }
				</h1>
				<p className="launchpad__sidebar-description">
					{ translate( 'Keep up the momentum with these next steps.' ) }
				</p>
				<div className="launchpad__url-box">{ url }</div>
				<Checklist siteSlug={ siteSlug } tasks={ tasks } flow={ flow } />
			</div>
		</div>
	);
};

export default Sidebar;
