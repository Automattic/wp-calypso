import { SubscriptionManager } from '@automattic/data-stores';
import { useTranslate } from 'i18n-calypso';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import Nav from 'calypso/components/section-nav';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';
import { Comments, Settings, Sites } from 'calypso/landing/subscriptions/components/tab-views';
import './styles.scss';

const getFullPath = ( subpath: string ) => `/subscriptions/${ subpath }`;
const [ sitesPath, commentsPath, settingsPath ] = [ 'sites', 'comments', 'settings' ].map(
	getFullPath
);

const TabsSwitcher = () => {
	const translate = useTranslate();
	const navigate = useNavigate();
	const { pathname } = useLocation();
	const { data: counts } = SubscriptionManager.useSubscriptionsCountQuery();

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
						onClick={ () =>
							window.location.replace(
								'https://wordpress.com/email-subscriptions/?option=comments'
							)
						}
						count={ counts?.comments || undefined }
						selected={ pathname.startsWith( commentsPath ) }
					>
						{ translate( 'Comments' ) }
					</NavItem>

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
				<Route path="sites*" element={ <Sites /> } />
				<Route path="comments*" element={ <Comments /> } />
				<Route path="settings" element={ <Settings /> } />
			</Routes>
		</>
	);
};

export default TabsSwitcher;
