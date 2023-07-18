import classNames from 'classnames';
import { translate } from 'i18n-calypso';
import { Card, ConfettiAnimation } from 'calypso/../packages/components/src';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import HappinessSupport from 'calypso/components/happiness-support';
import Main from 'calypso/components/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import isRedesignV2 from './redesign-v2/is-redesign-v2';
import MasterbarStyled from './redesign-v2/masterbar-styled';
import { CheckoutThankYouCombinedProps } from '.';

type AnalyticsProperties = {
	delay?: number;
	path: string;
	recorder?: () => void;
	hasSelectedSiteLoaded?: boolean;
	selectedSiteId?: number;
	properties?: Record< string, unknown >;
	options?: Record< string, unknown >;
};

type StandardCheckoutThankYouProps = {
	productRelatedMessages: () => JSX.Element;
	isDataLoaded: () => boolean;
	getAnalyticsProperties: () => AnalyticsProperties;
	showHappinessSupport: boolean;
	wasJetpackPlanPurchased: boolean;
} & CheckoutThankYouCombinedProps;

const StandardCheckoutThankYou = ( {
	productRelatedMessages,
	isDataLoaded,
	getAnalyticsProperties,
	showHappinessSupport,
	wasJetpackPlanPurchased,
	...props
}: StandardCheckoutThankYouProps ) => {
	return (
		<Main
			className={ classNames( 'checkout-thank-you', {
				'is-redesign-v2': isRedesignV2( props ),
			} ) }
		>
			<PageViewTracker { ...getAnalyticsProperties() } title="Checkout Thank You" />
			{ isDataLoaded() && isRedesignV2( props ) && <ConfettiAnimation delay={ 1000 } /> }
			{ isRedesignV2( props ) && props.selectedSite?.ID && (
				<>
					<QuerySitePurchases siteId={ props.selectedSite.ID } />
					<MasterbarStyled
						onClick={ () => page( `/home/${ props.selectedSiteSlug ?? '' }` ) }
						backText={ translate( 'Back to dashboard' ) }
						canGoBack={ true }
						showContact={ true }
					/>
				</>
			) }
			<Card className="checkout-thank-you__content">{ productRelatedMessages() }</Card>
			{ showHappinessSupport && (
				<Card className="checkout-thank-you__footer">
					<HappinessSupport
						isJetpack={ wasJetpackPlanPurchased }
						contactButtonEventName="calypso_plans_autoconfig_chat_initiated"
					/>
				</Card>
			) }
		</Main>
	);
};

export default StandardCheckoutThankYou;
