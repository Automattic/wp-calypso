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
	onTabChange: ( tab: TabType ) => void;
};

export enum TabType {
	mobile = 'mobile',
	desktop = 'desktop',
}

export const PerformanceProfilerHeader = ( props: HeaderProps ) => {
	const translate = useTranslate();
	const { url, activeTab, onTabChange } = props;
	const urlParts = new URL( url );

	return (
		<div className="profiler-header">
			<div className="l-block-wrapper">
				<div className="profiler-header-wrapper">
					<Badge />

					<div className="profiler-header__site-url">
						<h2>{ urlParts.hostname ?? '' }</h2>
						<PathName pathName={ urlParts.pathname } />
					</div>

					<div className="profiler-header__action">
						<Button href="/speed-test">Test another site</Button>
					</div>
				</div>
				<SectionNav className="profiler-navigation-tabs">
					<NavTabs>
						<NavItem
							onClick={ () => onTabChange( TabType.mobile ) }
							selected={ activeTab === TabType.mobile }
						>
							<Icon icon={ mobile } />
							<span>{ translate( 'Mobile' ) }</span>
						</NavItem>
						<NavItem
							onClick={ () => onTabChange( TabType.desktop ) }
							selected={ activeTab === TabType.desktop }
						>
							<Icon icon={ desktop } />
							<span>{ translate( 'Desktop' ) }</span>
						</NavItem>
					</NavTabs>

					<div className="profiler-header__navbar-right">
						<p>Tested on July 16th, 2024 at 12:03:23 AM</p>
					</div>
				</SectionNav>
			</div>
		</div>
	);
};

const PATHNAME_MAX_LENGTH = 50;
function PathName( props: { pathName?: string } ) {
	let { pathName } = props;

	if ( ! pathName || pathName === '/' ) {
		return;
	}

	if ( pathName.endsWith( '/' ) ) {
		pathName = pathName.slice( 0, -1 );
	}

	if ( pathName.length > PATHNAME_MAX_LENGTH ) {
		const parts = pathName.split( '/' );
		const hasHiddenParts = parts.length > 1;

		pathName = `${ hasHiddenParts ? '/...' : '' }/${ parts[ parts.length - 1 ] }`;
	}

	return <p>{ pathName }</p>;
}
