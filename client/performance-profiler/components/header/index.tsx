import { Popover } from '@automattic/components';
import { Button } from '@wordpress/components';
import { Icon, mobile, desktop, share } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import moment from 'moment';
import { useState, useRef } from 'react';
import WPcomBadge from 'calypso/assets/images/performance-profiler/wpcom-badge.svg';
import SectionNav from 'calypso/components/section-nav';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';
import ShareButton from 'calypso/components/share-button';
import { Badge } from 'calypso/performance-profiler/components/badge';

import './style.scss';

type HeaderProps = {
	url: string;
	activeTab: string;
	onTabChange: ( tab: TabType ) => void;
	showNavigationTabs?: boolean;
	timestamp?: string;
	showWPcomBadge?: boolean;
	shareLink: string;
};

export const TabTypes = {
	mobile: 'mobile',
	desktop: 'desktop',
};

export type TabType = ( typeof TabTypes )[ keyof typeof TabTypes ];

const SocialServices = [
	{
		service: 'x',
	},
	{
		service: 'linkedin',
	},
	{
		service: 'facebook',
	},
	{
		service: 'tumblr',
	},
];

export const PerformanceProfilerHeader = ( props: HeaderProps ) => {
	const translate = useTranslate();
	const [ showPopoverMenu, setPopoverMenu ] = useState( false );
	const popoverButtonRef = useRef( null );
	const { url, activeTab, onTabChange, showNavigationTabs, timestamp, showWPcomBadge, shareLink } =
		props;
	const urlParts = new URL( url );

	const renderTimestampAndBadge = () => (
		<>
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
		</>
	);

	return (
		<div className="profiler-header">
			<div className="l-block-wrapper">
				<div className="profiler-header-wrapper">
					<Button className="profiler-header__badge" href="https://wordpress.com/speed-test">
						<Badge />
					</Button>

					<div className="profiler-header__site-url">
						<h2>{ urlParts.hostname ?? '' }</h2>
						<PathName pathName={ urlParts.pathname } />
					</div>

					<div className="profiler-header__action">
						<Button href="https://wordpress.com/speed-test">
							{ translate( 'Test another site' ) }
						</Button>
					</div>
					<div className="profiler-header__report-site-details show-on-mobile">
						{ renderTimestampAndBadge() }
					</div>
				</div>
				{ showNavigationTabs && (
					<SectionNav className="profiler-navigation-tabs">
						<NavTabs enforceTabsView>
							<NavItem
								onClick={ () => onTabChange( TabTypes.mobile ) }
								selected={ activeTab === TabTypes.mobile }
							>
								<Icon icon={ mobile } />
								<span>{ translate( 'Mobile' ) }</span>
							</NavItem>
							<NavItem
								onClick={ () => onTabChange( TabTypes.desktop ) }
								selected={ activeTab === TabTypes.desktop }
							>
								<Icon icon={ desktop } />
								<span>{ translate( 'Desktop' ) }</span>
							</NavItem>
						</NavTabs>

						<div className="profiler-header__navbar-right">
							<div className="report-site-details hide-on-mobile">
								{ renderTimestampAndBadge() }
							</div>
							{ timestamp && (
								<>
									<div
										className="share-button"
										ref={ popoverButtonRef }
										role="button"
										tabIndex={ 0 }
										onKeyDown={ ( e ) => e.key === 'Enter' && setPopoverMenu( true ) }
										onClick={ () => setPopoverMenu( true ) }
									>
										<Icon className="share-icon" icon={ share } />
										<span>{ translate( 'Share' ) }</span>
									</div>
									<Popover
										id="profiler-share-buttons-popover"
										isVisible={ showPopoverMenu }
										context={ popoverButtonRef.current }
										position="top"
										onClose={ () => setPopoverMenu( false ) }
									>
										{ SocialServices.map( ( item ) => (
											<ShareButton
												key={ item.service }
												size={ 28 }
												url={ shareLink }
												title=""
												service={ item.service }
											/>
										) ) }
									</Popover>
								</>
							) }
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
