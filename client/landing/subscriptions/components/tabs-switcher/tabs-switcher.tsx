import config from '@automattic/calypso-config';
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
	const shouldEnableCommentsTab =
		config.isEnabled( 'subscription-management-comments-view' ) && locale === 'en';
	const shouldEnablePendingTab =
		config.isEnabled( 'subscription-management-pending-view' ) && locale === 'en';

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
						onClick={ () => {
							shouldEnableCommentsTab
								? navigate( commentsPath )
								: window.location.replace(
										'https://wordpress.com/email-subscriptions/?option=comments'
								  );
						} }
						count={ counts?.comments || undefined }
						selected={ pathname.startsWith( commentsPath ) }
					>
						{ translate( 'Comments' ) }
					</NavItem>

					{ shouldEnablePendingTab && counts?.pending ? (
						<NavItem
							onClick={ () => {
								shouldEnablePendingTab
									? navigate( pendingPath )
									: window.location.replace(
											'https://wordpress.com/email-subscriptions/?option=pending'
									  );
							} }
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
