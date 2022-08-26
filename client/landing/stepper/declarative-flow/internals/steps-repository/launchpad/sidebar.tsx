import WordPressLogo from 'calypso/components/wordpress-logo';
import { useFlowParam } from 'calypso/landing/stepper/hooks/use-flow-param';
import Checklist from './checklist';
import { tasks } from './tasks';
import { getLaunchpadTranslations } from './translations';

function getUrlInfo( url: string ) {
	const urlWithoutProtocol = url.replace( /^https?:\/\//, '' );

	// Ex. mytest.wordpress.com matches mytest
	const siteName = urlWithoutProtocol.match( /^[^.]*/ );
	// Ex. mytest.wordpress.com matches .wordpress.com
	const topLevelDomain = urlWithoutProtocol.match( /\..*/ ) || [];

	return [ siteName ? siteName[ 0 ] : '', topLevelDomain ? topLevelDomain[ 0 ] : '' ];
}

const Sidebar = ( { siteSlug }: { siteSlug: string | null } ) => {
	let siteName = '';
	let topLevelDomain = '';
	const flow = useFlowParam();
	const translatedStrings = getLaunchpadTranslations( flow );

	if ( siteSlug ) {
		[ siteName, topLevelDomain ] = getUrlInfo( siteSlug );
	}

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
				<p className="launchpad__sidebar-description">{ translatedStrings.sidebarSubtitle }</p>
				<div className="launchpad__url-box">
					<span>{ siteName }</span>
					<span className="launchpad__url-box-top-level-domain">{ topLevelDomain }</span>
				</div>
				<Checklist siteSlug={ siteSlug } tasks={ tasks } flow={ flow } />
			</div>
		</div>
	);
};

export default Sidebar;
