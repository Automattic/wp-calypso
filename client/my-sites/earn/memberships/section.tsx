import { useTranslate } from 'i18n-calypso';
import { useEffect, useCallback } from 'react';
import QueryMembershipsSettings from 'calypso/components/data/query-memberships-settings';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import Notice from 'calypso/components/notice';
import NoticeAction from 'calypso/components/notice/notice-action';
import { useSelector } from 'calypso/state';
import { getProductsForSiteId } from 'calypso/state/memberships/product-list/selectors';
import {
	getConnectedAccountIdForSiteId,
	getConnectUrlForSiteId,
} from 'calypso/state/memberships/settings/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import { Query } from '../types';
import {
	ADD_TIER_PLAN_HASH,
	OLD_ADD_NEWSLETTER_PAYMENT_PLAN_HASH,
	LAUNCHPAD_HASH,
} from './constants';
import ProductList from './products-list';
import './style.scss';
import Settings from './settings';

type MembershipsSectionProps = {
	query?: Query;
};

function MembershipsSection( { query }: MembershipsSectionProps ) {
	const translate = useTranslate();

	const source = getSource();

	const site = useSelector( ( state ) => getSelectedSite( state ) );

	const connectedAccountId = useSelector( ( state ) =>
		getConnectedAccountIdForSiteId( state, site?.ID )
	);

	const products = useSelector( ( state ) => getProductsForSiteId( state, site?.ID ) );

	const connectUrl: string = useSelector( ( state ) => getConnectUrlForSiteId( state, site?.ID ) );

	const navigateToLaunchpad = useCallback( () => {
		const shouldGoToLaunchpad = query?.stripe_connect_success === 'launchpad';
		const siteIntent = site?.options?.site_intent;
		if ( shouldGoToLaunchpad ) {
			window.location.assign( `/setup/${ siteIntent }/launchpad?siteSlug=${ site?.slug }` );
		}
	}, [ query, site ] );

	function renderNotices() {
		const stripe_connect_success = query?.stripe_connect_success;
		const stripe_connect_canclled = Boolean( query?.stripe_connect_success );

		if ( stripe_connect_success === 'earn' ) {
			const siteHasPlans = products.length !== 0;

			let congratsText;
			if ( ! siteHasPlans ) {
				congratsText = translate(
					'Congrats! Your site is now connected to Stripe. You can now add your first payment plan.'
				);
			} else {
				congratsText = translate( 'Congrats! Your site is now connected to Stripe.' );
			}

			return (
				<Notice status="is-success" showDismiss={ false } text={ congratsText }>
					<NoticeAction href={ `/earn/payments/${ site?.slug }` } icon="create">
						{ translate( 'Add a payment plan' ) }
					</NoticeAction>
				</Notice>
			);
		}

		if ( stripe_connect_success === 'earn-newsletter' ) {
			return (
				<Notice
					status="is-success"
					showDismiss={ false }
					text={ translate(
						'Congrats! Your site is now connected to Stripe. You can now add payments to your newsletter.'
					) }
				>
					<NoticeAction
						external
						icon="create"
						href={ `/earn/payments/${ site?.slug }${ ADD_TIER_PLAN_HASH }` }
					>
						{ translate( 'Add tiers' ) }
					</NoticeAction>
				</Notice>
			);
		}

		if ( stripe_connect_canclled ) {
			return (
				<Notice
					showDismiss={ false }
					text={ translate(
						'The attempt to connect to Stripe has been cancelled. You can connect again at any time.'
					) }
				/>
			);
		}

		return null;
	}

	useEffect( () => {
		navigateToLaunchpad();
	}, [ navigateToLaunchpad ] );

	if ( ! site ) {
		return <LoadingEllipsis />;
	}

	return (
		<div>
			<QueryMembershipsSettings siteId={ site.ID } source={ source } />
			{ ! connectedAccountId && ! connectUrl && (
				<div className="earn__payments-loading">
					<LoadingEllipsis />
				</div>
			) }
			<div>
				{ renderNotices() }
				<ProductList />
				<Settings />
			</div>
		</div>
	);
}

/**
 * Source is used to add data to the Stripe Connect URL. On a successful
 * connection, this source is used to redirect the user the appropriate place.
 */
function getSource() {
	if (
		window.location.hash === OLD_ADD_NEWSLETTER_PAYMENT_PLAN_HASH ||
		window.location.hash === ADD_TIER_PLAN_HASH
	) {
		return 'earn-newsletter';
	}
	if ( window.location.hash === LAUNCHPAD_HASH ) {
		return 'full-launchpad';
	}
	return 'calypso';
}

export default MembershipsSection;
