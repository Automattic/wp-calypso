import {
	__experimentalNavigatorProvider as NavigatorProvider,
	__experimentalNavigatorScreen as NavigatorScreen,
	__experimentalNavigatorButton as NavigatorButton,
	__experimentalNavigatorToParentButton as NavigatorToParentButton,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	Card,
	CardBody,
	__experimentalItem as Item,
	FlexBlock,
} from '@wordpress/components';
import {
	plugins,
	key,
	currencyDollar,
	store,
	payment,
	receipt,
	tag,
	list,
	chevronRightSmall,
	chevronLeft,
	Icon,
} from '@wordpress/icons';
import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import page from 'page';

import './style.scss';

export default function DashboardSidebar( { path }: { path: string } ) {
	const translate = useTranslate();

	const onClickSubMenuItem = ( path: string ) => {
		page.redirect( path );
	};

	const isPartnerPortal = path.startsWith( '/partner-portal' );

	const SidebarItem = ( { className, icon, withChevron = false, suffix, children, ...props } ) => {
		return (
			<Item
				className={ classnames( className, {
					'is-active': path === props.link,
					'sidebar-button': true,
				} ) }
				{ ...props }
			>
				<HStack justify="flex-start">
					{ icon && <Icon style={ { fill: 'currentcolor' } } icon={ icon } size={ 24 } /> }
					<FlexBlock>{ children }</FlexBlock>
					{ withChevron && <Icon icon={ chevronRightSmall } size={ 24 } /> }
					{ ! withChevron && suffix }
				</HStack>
			</Item>
		);
	};

	const initialPath = isPartnerPortal ? '/partner-portal' : '/';

	return (
		<>
			<NavigatorProvider
				initialPath={ initialPath }
				style={ {
					height: '100vh',
					maxHeight: '450px',
				} }
			>
				<NavigatorScreen path="/">
					<Card>
						<CardBody>
							<VStack spacing={ 0 } justify="flex-start">
								<NavigatorButton
									as={ SidebarItem }
									icon={
										<svg
											width="24"
											height="24"
											viewBox="0 0 24 24"
											fill="none"
											xmlns="http://www.w3.org/2000/svg"
										>
											<path
												fillRule="evenodd"
												clipRule="evenodd"
												d="M6 5.5H9C9.27614 5.5 9.5 5.72386 9.5 6V9C9.5 9.27614 9.27614 9.5 9 9.5H6C5.72386 9.5 5.5 9.27614 5.5 9V6C5.5 5.72386 5.72386 5.5 6 5.5ZM4 6C4 4.89543 4.89543 4 6 4H9C10.1046 4 11 4.89543 11 6V9C11 10.1046 10.1046 11 9 11H6C4.89543 11 4 10.1046 4 9V6ZM15 5.5H18C18.2761 5.5 18.5 5.72386 18.5 6V9C18.5 9.27614 18.2761 9.5 18 9.5H15C14.7239 9.5 14.5 9.27614 14.5 9V6C14.5 5.72386 14.7239 5.5 15 5.5ZM13 6C13 4.89543 13.8954 4 15 4H18C19.1046 4 20 4.89543 20 6V9C20 10.1046 19.1046 11 18 11H15C13.8954 11 13 10.1046 13 9V6ZM18 14.5H15C14.7239 14.5 14.5 14.7239 14.5 15V18C14.5 18.2761 14.7239 18.5 15 18.5H18C18.2761 18.5 18.5 18.2761 18.5 18V15C18.5 14.7239 18.2761 14.5 18 14.5ZM15 13C13.8954 13 13 13.8954 13 15V18C13 19.1046 13.8954 20 15 20H18C19.1046 20 20 19.1046 20 18V15C20 13.8954 19.1046 13 18 13H15ZM6 14.5H9C9.27614 14.5 9.5 14.7239 9.5 15V18C9.5 18.2761 9.27614 18.5 9 18.5H6C5.72386 18.5 5.5 18.2761 5.5 18V15C5.5 14.7239 5.72386 14.5 6 14.5ZM4 15C4 13.8954 4.89543 13 6 13H9C10.1046 13 11 13.8954 11 15V18C11 19.1046 10.1046 20 9 20H6C4.89543 20 4 19.1046 4 18V15Z"
											/>
										</svg>
									}
									path="/"
									link="/dashboard"
									onClick={ () => onClickSubMenuItem( '/dashboard' ) }
								>
									{ translate( 'Sites Management' ) }
								</NavigatorButton>
								<NavigatorButton
									as={ SidebarItem }
									icon={ plugins }
									path="/"
									link="/plugins/manage"
									onClick={ () => onClickSubMenuItem( '/plugins/manage' ) }
								>
									{ translate( 'Plugin Management' ) }
								</NavigatorButton>
								<NavigatorButton
									as={ SidebarItem }
									icon={ key }
									path="/"
									link="/partner-portal/licenses"
									onClick={ () => onClickSubMenuItem( '/partner-portal/licenses' ) }
								>
									{ translate( 'Licenses' ) }
								</NavigatorButton>
								<NavigatorButton
									as={ SidebarItem }
									icon={ currencyDollar }
									path="/partner-portal"
									withChevron
									link="/partner-portal/billing"
									onClick={ () => onClickSubMenuItem( '/partner-portal/billing' ) }
								>
									{ translate( 'Purchases' ) }
								</NavigatorButton>
							</VStack>
						</CardBody>
					</Card>
				</NavigatorScreen>
				<NavigatorScreen path="/partner-portal">
					<Card>
						<CardBody className="sidebar__navigation-sub-menu">
							<VStack spacing={ 0 } justify="flex-start">
								<NavigatorToParentButton
									icon={ chevronLeft }
									onClick={ () => onClickSubMenuItem( '/dashboard' ) }
									text={ translate( 'Purchases' ) }
								/>
								<div>
									<div className="sidebar__navigation-group-description">
										{ translate( 'Manage all your billing related settings from one place.' ) }
									</div>
									<NavigatorButton
										as={ SidebarItem }
										icon={ store }
										path="/partner-portal"
										link="/partner-portal/billing"
										onClick={ () => onClickSubMenuItem( '/partner-portal/billing' ) }
									>
										{ translate( 'Billing' ) }
									</NavigatorButton>
									<NavigatorButton
										as={ SidebarItem }
										icon={ payment }
										path="/partner-portal"
										link="/partner-portal/payment-methods"
										onClick={ () => onClickSubMenuItem( '/partner-portal/payment-methods' ) }
									>
										{ translate( 'Payment Methods' ) }
									</NavigatorButton>
									<NavigatorButton
										as={ SidebarItem }
										icon={ receipt }
										path="/partner-portal"
										link="/partner-portal/invoices"
										onClick={ () => onClickSubMenuItem( '/partner-portal/invoices' ) }
									>
										{ translate( 'Invoices' ) }
									</NavigatorButton>
									<NavigatorButton
										as={ SidebarItem }
										icon={ tag }
										path="/partner-portal"
										link="/partner-portal/prices"
										onClick={ () => onClickSubMenuItem( '/partner-portal/prices' ) }
									>
										{ translate( 'Prices' ) }
									</NavigatorButton>
									<NavigatorButton
										as={ SidebarItem }
										icon={ list }
										path="/partner-portal"
										link="/partner-portal/company-details"
										onClick={ () => onClickSubMenuItem( '/partner-portal/company-details' ) }
									>
										{ translate( 'Company Details' ) }
									</NavigatorButton>
								</div>
							</VStack>
						</CardBody>
					</Card>
				</NavigatorScreen>
			</NavigatorProvider>
		</>
	);
}
