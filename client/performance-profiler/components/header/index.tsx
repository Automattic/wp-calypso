import { Button } from '@wordpress/components';
import { Icon, mobile, desktop } from '@wordpress/icons';
import SectionNav from 'calypso/components/section-nav';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';

import './styles.scss';

type HeaderProps = {
	url: string;
	active: string;
	onTabChange: ( tab: string ) => void;
};

const PerformanceProfilerHeader = ( props: HeaderProps ) => {
	const { url, active, onTabChange } = props;
	const urlParts = new URL( url );
	const displayPath = ( pathname: string ) => {
		if ( pathname && pathname !== '/' && ! pathname.endsWith( '/' ) ) {
			return <p>{ pathname }</p>;
		}
	};

	return (
		<div className="profiler-header l-block-wrapper">
			<div className="profiler-header-wrapper">
				<div className="speed-test-badge">
					<h1>WordPress Speed Test</h1>
				</div>

				<div className="profiler-header__site-url">
					<h2>{ urlParts.hostname ?? '' }</h2>
					{ displayPath( urlParts.pathname ) }
				</div>

				<div className="profiler-header__action">
					<Button href="/speed-test">Test another site</Button>
				</div>
			</div>
			<SectionNav>
				<NavTabs>
					<NavItem onClick={ () => onTabChange( 'mobile' ) } selected={ active === 'mobile' }>
						<Icon icon={ mobile } />
						Mobile
					</NavItem>
					<NavItem onClick={ () => onTabChange( 'desktop' ) } selected={ active === 'desktop' }>
						<Icon icon={ desktop } />
						Desktop
					</NavItem>
				</NavTabs>

				<div className="profiler-header__navbar-right">
					<p>Tested on July 16th, 2024 at 12:03:23 AM</p>
				</div>
			</SectionNav>
		</div>
	);
};

export default PerformanceProfilerHeader;
