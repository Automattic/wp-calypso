import { SubscriptionManager } from '@automattic/data-stores';
import { useLocale } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import DocumentHead from 'calypso/components/data/document-head';
import Nav from 'calypso/components/section-nav';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';
import {
	Comments,
	Pending,
	Settings,
	Sites,
} from 'calypso/landing/subscriptions/components/tab-views';
import './styles.scss';

type SubscriptionManagerTab = {
	id: string;
	label: string;
	count?: number;
	onClick: () => void;
	selected: boolean;
	hide?: boolean;
};

const getPath = ( subpath: string ) => `/subscriptions/${ subpath }`;

// Localed path only applies for external users, WPCOM users inherits locale from user's language settings.
const getPathWithLocale = ( subpath: string, locale: string, isLoggedIn: boolean ) =>
	getPath( subpath ) + ( ! isLoggedIn && locale !== 'en' ? '/' + locale : '' );

const useTabs = (): SubscriptionManagerTab[] => {
	const navigate = useNavigate();
	const { pathname } = useLocation();
	const translate = useTranslate();
	const locale = useLocale();
	const { isLoggedIn } = SubscriptionManager.useIsLoggedIn();
	const { data: counts } = SubscriptionManager.useSubscriptionsCountQuery();

	return useMemo( () => {
		return [
			{
				id: 'sites',
				label: translate( 'Sites' ),
				count: counts?.blogs || undefined,
				onClick: () => navigate( getPathWithLocale( 'sites', locale, isLoggedIn ) ),
				selected: pathname.startsWith( getPath( 'sites' ) ),
			},
			{
				id: 'comments',
				label: translate( 'Comments' ),
				count: undefined, // temporarily disable inaccurate comments count
				onClick: () => navigate( getPathWithLocale( 'comments', locale, isLoggedIn ) ),
				selected: pathname.startsWith( getPath( 'comments' ) ),
			},
			{
				id: 'pending',
				label: translate( 'Pending' ),
				count: counts?.pending || undefined,
				onClick: () => navigate( getPathWithLocale( 'pending', locale, isLoggedIn ) ),
				selected: pathname.startsWith( getPath( 'pending' ) ),
				hide: ! counts?.pending && ! pathname.includes( 'pending' ),
			},
			{
				id: 'settings',
				label: translate( 'Settings' ),
				onClick: () => navigate( getPathWithLocale( 'settings', locale, isLoggedIn ) ),
				selected: pathname.startsWith( getPath( 'settings' ) ),
			},
		];
	}, [ counts?.blogs, counts?.pending, locale, isLoggedIn, navigate, pathname, translate ] );
};

const TabsSwitcher = () => {
	const translate = useTranslate();
	const tabs = useTabs();
	const { label: selectedText, count: selectedCount } = tabs.find( ( tab ) => tab.selected ) ?? {};
	return (
		<>
			<DocumentHead
				title={ translate( 'Subscriptions: %s', {
					args: selectedText,
					comment:
						'%s is the selected tab. Example: "Subscriptions: Sites" or "Subscriptions: Comments"',
				} ) }
			/>
			<Nav
				className="subscription-manager-tab-switcher"
				selectedText={ selectedText }
				selectedCount={ selectedCount }
			>
				<NavTabs>
					{ tabs.map( ( tab ) =>
						tab.hide ? null : (
							<NavItem
								key={ tab.id }
								onClick={ tab.onClick }
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
