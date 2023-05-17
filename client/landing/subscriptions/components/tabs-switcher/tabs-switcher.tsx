import { SubscriptionManager } from '@automattic/data-stores';
import { useLocale } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
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

const TabsSwitcher = () => {
	const translate = useTranslate();
	const navigate = useNavigate();
	const { pathname } = useLocation();
	const { data: counts } = SubscriptionManager.useSubscriptionsCountQuery();
	const locale = useLocale();

	const getFullPath = ( subpath: string ) =>
		`/subscriptions/${ subpath }${ locale !== 'en' ? '/' + locale : '' }`;
	const [ sitesPath, commentsPath, pendingPath, settingsPath ] = [
		'sites',
		'comments',
		'pending',
		'settings',
	].map( getFullPath );

	return (
		<>
			<Nav className="subscription-manager-tab-switcher">
				<NavTabs>
					<NavItem
						onClick={ () => navigate( sitesPath ) }
						count={ counts?.blogs || undefined }
						selected={ pathname.startsWith( sitesPath ) }
					>
						{ translate( 'Sites' ) }
					</NavItem>

					<NavItem
						onClick={ () => navigate( commentsPath ) }
						count={ undefined /* temporarily disable inaccurate comments count */ }
						selected={ pathname.startsWith( commentsPath ) }
					>
						{ translate( 'Comments' ) }
					</NavItem>

					{ counts?.pending || pathname.includes( 'pending' ) ? (
						<NavItem
							onClick={ () => navigate( pendingPath ) }
							count={ counts?.pending || undefined }
							selected={ pathname.startsWith( pendingPath ) }
						>
							{ translate( 'Pending' ) }
						</NavItem>
					) : (
						''
					) }

					<NavItem
						onClick={ () => navigate( settingsPath ) }
						selected={ pathname.startsWith( settingsPath ) }
					>
						{ translate( 'Settings' ) }
					</NavItem>
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
