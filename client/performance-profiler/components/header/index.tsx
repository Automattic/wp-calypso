import { Button } from '@wordpress/components';
import { Icon, mobile, desktop, share } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import moment from 'moment';
import WPcomBadge from 'calypso/assets/images/performance-profiler/wpcom-badge.svg';
import SectionNav from 'calypso/components/section-nav';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';
import { Badge } from 'calypso/performance-profiler/components/badge';

import './style.scss';

type HeaderProps = {
	url: string;
	activeTab: string;
	onTabChange: ( tab: TabType ) => void;
	showNavigationTabs?: boolean;
	timestamp?: string;
	showWPcomBadge?: boolean;
};

export enum TabType {
	mobile = 'mobile',
	desktop = 'desktop',
}

export const PerformanceProfilerHeader = ( props: HeaderProps ) => {
	const translate = useTranslate();
	const { url, activeTab, onTabChange, showNavigationTabs, timestamp, showWPcomBadge } = props;
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
						<Button href="https://wordpress.com/speed-test">
							{ translate( 'Test another site' ) }
						</Button>
					</div>
				</div>
				{ showNavigationTabs && (
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
							<div className="report-site-details">
								{ timestamp && (
									<span>
										{ translate( 'Tested on %(date)s', {
											args: { date: moment( timestamp ).format( 'MMMM Do, YYYY h:mm:ss A' ) },
										} ) }
									</span>
								) }
								{ showWPcomBadge && (
									<span className="wpcom-badge">
										<img src={ WPcomBadge } alt={ translate( 'WordPress.com badge' ) } />
										<span>{ translate( 'Hosted on WordPress.com' ) }</span>
									</span>
								) }
							</div>
							<div
								className="share-option"
								onClick={ () => alert( 'To be implemented' ) }
								onKeyUp={ () => {} }
								role="button"
								tabIndex={ 0 }
							>
								<Icon className="share-icon" icon={ share } />
								<span>{ translate( 'Share results' ) }</span>
							</div>
						</div>
					</SectionNav>
				) }
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
		if ( pathName.startsWith( '/' ) ) {
			pathName = pathName.slice( 1 );
		}

		const parts = pathName.split( '/' );
		const hasHiddenParts = parts.length > 1;

		pathName = `${ hasHiddenParts ? '/...' : '' }/${ parts[ parts.length - 1 ] }`;
	}

	return <p>{ pathName }</p>;
}
