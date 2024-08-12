import { Button } from '@wordpress/components';
import { Icon, mobile, desktop } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import SectionNav from 'calypso/components/section-nav';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';
import { Badge } from 'calypso/performance-profiler/components/badge';

import './style.scss';

type HeaderProps = {
	url: string;
	activeTab: string;
	onTabChange: ( tab: string ) => void;
};

const PerformanceProfilerHeader = ( props: HeaderProps ) => {
	const translate = useTranslate();
	const { url, activeTab, onTabChange } = props;
	const urlParts = new URL( url );
	const displayPath = ( pathname: string ) => {
		if ( pathname && pathname !== '/' && ! pathname.endsWith( '/' ) ) {
			return <p>{ pathname }</p>;
		}
	};

	return (
		<div className="profiler-header l-block-wrapper">
			<div className="profiler-header-wrapper">
				<Badge />

				<div className="profiler-header__site-url">
					<h2>{ urlParts.hostname ?? '' }</h2>
					{ displayPath( urlParts.pathname ) }
				</div>

				<div className="profiler-header__action">
					<Button href="/speed-test">Test another site</Button>
				</div>
			</div>
			<SectionNav className="profiler-navigation-tabs">
				<NavTabs>
					<NavItem onClick={ () => onTabChange( 'mobile' ) } selected={ activeTab === 'mobile' }>
						<Icon icon={ mobile } />
						<span>{ translate( 'Mobile' ) }</span>
					</NavItem>
					<NavItem onClick={ () => onTabChange( 'desktop' ) } selected={ activeTab === 'desktop' }>
						<Icon icon={ desktop } />
						<span>{ translate( 'Desktop' ) }</span>
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
