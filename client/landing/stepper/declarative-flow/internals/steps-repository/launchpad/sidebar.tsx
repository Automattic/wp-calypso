import { useTranslate } from 'i18n-calypso';
import WordPressLogo from 'calypso/components/wordpress-logo';
import { useFlowParam } from 'calypso/landing/stepper/hooks/use-flow-param';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import Checklist from './checklist';
import { tasks } from './tasks';
import { getLaunchpadTranslations } from './translations';

const Sidebar = ( { siteSlug }: { siteSlug: string | null } ) => {
	const translate = useTranslate();
	const site = useSite();
	const url = site?.URL?.replace( /^https?:\/\//, '' );
	const flow = useFlowParam();
	const translatedStrings = getLaunchpadTranslations( flow );

	return (
		<div className="launchpad__sidebar">
			<div className="launchpad__sidebar-header">
				<WordPressLogo className="launchpad__sidebar-header-logo" size={ 24 } />
				<span className="launchpad__sidebar-header-flow-name">{ translatedStrings.flowName }</span>
			</div>
			<div className="launchpad__sidebar-content-container">
				<div className="launchpad__progress-bar-container">
					<span className="launchpad__progress-value">33%</span>
					<div className="launchpad__progress-bar">
						<div className="launchpad__progress-bar-completed" />
					</div>
				</div>
				{ /* eslint-disable-next-line wpcalypso/jsx-classname-namespace*/ }
				<h1 className="launchpad__sidebar-h1">{ translatedStrings.sidebarTitle }</h1>
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
