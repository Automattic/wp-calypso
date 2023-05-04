import config from '@automattic/calypso-config';
import { SubscriptionManager } from '@automattic/data-stores';
import { useLocale } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import Nav from 'calypso/components/section-nav';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';
import {
	Comments,
	Settings,
	Sites,
	Pending,
} from 'calypso/landing/subscriptions/components/tab-views';
import './styles.scss';

type SubscriptionManagerTab = {
	label: string;
	subpath: string;
	fullPath: string;
	count?: number;
	selected: boolean;
	redirectURL?: string;
	hide?: boolean;
};

const getFullPath = ( subpath: string, locale: string ) =>
	`/subscriptions/${ subpath }${ locale !== 'en' ? '/' + locale : '' }`;

const useTabs = (): SubscriptionManagerTab[] => {
	const { pathname } = useLocation();
	const translate = useTranslate();
	const locale = useLocale();
	const { data: counts } = SubscriptionManager.useSubscriptionsCountQuery();
	const { isLoggedIn } = SubscriptionManager.useIsLoggedIn();

	const isCommentsViewEnabled =
		config.isEnabled( 'subscription-management-comments-view' ) && locale === 'en' && ! isLoggedIn;
	const isPendingViewEnabled =
		config.isEnabled( 'subscription-management-pending-view' ) && locale === 'en' && ! isLoggedIn;

	return useMemo( () => {
		return [
			{
				label: translate( 'Sites' ),
				subpath: 'sites',
				fullPath: getFullPath( 'sites', locale ),
				count: counts?.blogs || undefined,
				selected: pathname.startsWith( getFullPath( 'sites', locale ) ),
			},
			{
				label: translate( 'Comments' ),
				subpath: 'comments',
				fullPath: getFullPath( 'comments', locale ),
				count: counts?.comments || undefined,
				selected: pathname.startsWith( getFullPath( 'comments', locale ) ),
				...( isCommentsViewEnabled && {
					redirectURL: `https://wordpress.com/email-subscriptions/?option=comments&locale=${ locale }`,
				} ),
			},
			{
				label: translate( 'Pending' ),
				subpath: 'pending',
				fullPath: getFullPath( 'pending', locale ),
				count: counts?.pending || undefined,
				selected: pathname.startsWith( getFullPath( 'pending', locale ) ),
				...( isPendingViewEnabled && {
					redirectURL: `https://wordpress.com/email-subscriptions/pending`,
				} ),
				hide: ! counts?.pending && ! pathname.includes( 'pending' ),
			},
			{
				label: translate( 'Settings' ),
				fullPath: getFullPath( 'settings', locale ),
				subpath: 'settings',
				selected: pathname.startsWith( getFullPath( 'settings', locale ) ),
			},
		];
	}, [
		counts?.blogs,
		counts?.comments,
		counts?.pending,
		isCommentsViewEnabled,
		isPendingViewEnabled,
		locale,
		pathname,
		translate,
	] );
};

const TabsSwitcher = () => {
	const navigate = useNavigate();
	const tabs = useTabs();
	const { label: selectedText, count: selectedCount } = tabs.find( ( tab ) => tab.selected ) ?? {};
	return (
		<>
			<Nav
				className="subscription-manager-tab-switcher"
				selectedText={ selectedText }
				selectedCount={ selectedCount }
			>
				<NavTabs>
					{ tabs.map( ( tab ) =>
						tab.hide ? null : (
							<NavItem
								key={ tab.subpath }
								onClick={ () => {
									tab.redirectURL
										? window.location.replace( tab.redirectURL )
										: navigate( tab.fullPath );
								} }
								count={ tab.count }
								selected={ tab.selected }
							>
								{ tab.label }
							</NavItem>
						)
					) }
				</NavTabs>
			</Nav>

			<Routes>
				<Route index element={ <Navigate to="sites" /> } />
				<Route path="sites/*" element={ <Sites /> } />
				<Route path="comments/*" element={ <Comments /> } />
				<Route path="pending/*" element={ <Pending /> } />
				<Route path="settings/*" element={ <Settings /> } />
			</Routes>
		</>
	);
};

export default TabsSwitcher;
