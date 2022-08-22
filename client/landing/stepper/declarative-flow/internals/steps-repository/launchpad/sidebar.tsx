import WordPressLogo from 'calypso/components/wordpress-logo';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import Checklist from './checklist';
import { tasks } from './tasks';

function getUrlInfo( url: string ) {
	const urlWithoutProtocol = url.replace( /^https?:\/\//, '' );

	// Ex. mytest.wordpress.com matches mytest
	const siteName = urlWithoutProtocol.match( /^[^.]*/ );
	// Ex. mytest.wordpress.com matches .wordpress.com
	const topLevelDomain = urlWithoutProtocol.match( /\..*/ ) || [];

	return [ siteName ? siteName[ 0 ] : '', topLevelDomain ? topLevelDomain[ 0 ] : '' ];
}

const Sidebar = () => {
	const site = useSite();
	let siteName = '';
	let topLevelDomain = '';

	if ( site?.URL ) {
		[ siteName, topLevelDomain ] = getUrlInfo( site.URL );
	}

	return (
		<div className="launchpad__sidebar">
			<div className="launchpad__sidebar-header">
				<WordPressLogo className="launchpad__sidebar-header-logo" size={ 24 } />
				<span className="launchpad__sidebar-header-flow-name">Newsletter</span>
			</div>
			<div className="launchpad__sidebar-content-container">
				<div className="launchpad__progress-bar-container">
					<span className="launchpad__progress-value">33%</span>
					<div className="launchpad__progress-bar">
						<div className="launchpad__progress-bar-completed" />
					</div>
				</div>
				{ /* eslint-disable-next-line wpcalypso/jsx-classname-namespace*/ }
				<h1 className="launchpad__sidebar-h1">Voilà! Your Newsletter is up and running!</h1>
				<p className="launchpad__sidebar-description">
					Keep up the momentum with these next steps.
				</p>
				<div className="launchpad__url-box">
					<span>{ siteName }</span>
					<span className="launchpad__url-box-top-level-domain">{ topLevelDomain }</span>
				</div>
				<Checklist tasks={ tasks } />
			</div>
		</div>
	);
};

export default Sidebar;
