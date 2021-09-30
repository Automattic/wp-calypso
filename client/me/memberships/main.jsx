import { CompactCard } from '@automattic/components';
import formatCurrency from '@automattic/format-currency';
import PurchasesNavigation from 'calyspo/me/purchases/purchases-navigation';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import noMembershipsImage from 'calypso/assets/images/illustrations/no-memberships.svg';
import DocumentHead from 'calypso/components/data/document-head';
import QueryMembershipsSubscriptions from 'calypso/components/data/query-memberships-subscriptions';
import EmptyContent from 'calypso/components/empty-content';
import FormattedHeader from 'calypso/components/formatted-header';
import { withLocalizedMoment } from 'calypso/components/localized-moment';
import Main from 'calypso/components/main';
import SectionHeader from 'calypso/components/section-header';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import titles from 'calypso/me/purchases/titles';
import MeSidebarNavigation from 'calypso/me/sidebar-navigation';
import { getAllSubscriptions } from 'calypso/state/memberships/subscriptions/selectors';

import './style.scss';

const getMembershipEndDate = ( translate, endDate, moment ) => {
	if ( ! endDate ) {
		return translate( 'Never Expires' );
	}
	return moment( endDate ).format( 'll' );
};

const getMembershipEndDateFromNow = ( translate, endDate, moment ) => {
	if ( ! endDate ) {
		return '-';
	}
	return translate( 'Renews %s', { args: moment( endDate ).fromNow() } );
};

const getMembershipRenewalInterval = ( translate, renewalInterval ) => {
	if ( ! renewalInterval ) {
		return '-';
	}
	return translate( 'Every %s', { args: renewalInterval } );
};

const MembershipItem = ( { translate, subscription, moment } ) => (
	<CompactCard key={ subscription.ID } href={ '/me/purchases/other/' + subscription.ID }>
		<div className="memberships__list-subscription">
			<div className="memberships__list-date">
				<div>{ getMembershipEndDate( translate, subscription.end_date, moment ) }</div>
				<div className="memberships__list-sub">
					{ getMembershipEndDateFromNow( translate, subscription.end_date, moment ) }
				</div>
			</div>
			<div className="memberships__service-description">
				<div className="memberships__service-name">{ subscription.title }</div>
				<div className="memberships__list-sub">
					{ translate( 'On %s', { args: subscription.site_title } ) }
				</div>
			</div>
			<div className="memberships__list-renewal-price">
				<div className="memberships__list-amount">
					{ formatCurrency( subscription.renewal_price, subscription.currency ) }
				</div>
				<div className="memberships__list-sub">
					{ getMembershipRenewalInterval( translate, subscription.renew_interval ) }
				</div>
			</div>
		</div>
	</CompactCard>
);

const MembershipsHistory = ( { translate, subscriptions, moment } ) => {
	let content;
	if ( subscriptions && subscriptions.length ) {
		content = (
			<>
				<SectionHeader label={ translate( 'Active payments plans' ) } />
				{ subscriptions.map(
					( subscription ) => (
						<MembershipItem
							key={ subscription.ID }
							translate={ translate }
							subscription={ subscription }
							moment={ moment }
						/>
					),
					this
				) }
			</>
		);
	} else {
		content = (
			<CompactCard className="memberships__no-content">
				<EmptyContent
					title={ translate( 'No payments found.' ) }
					illustration={ noMembershipsImage }
				/>
			</CompactCard>
		);
	}

	return (
		<Main wideLayout className="memberships">
			<DocumentHead title={ translate( 'Other Sites' ) } />
			<PageViewTracker path="/me/purchases/other" title="Me > Other Sites" />
			<FormattedHeader brandFont headerText={ titles.sectionTitle } align="left" />
			<MeSidebarNavigation />
			<QueryMembershipsSubscriptions />
			<PurchasesNavigation section="activeUpgrades" />
			{ content }
		</Main>
	);
};

export default connect( ( state ) => ( {
	subscriptions: getAllSubscriptions( state ),
} ) )( localize( withLocalizedMoment( MembershipsHistory ) ) );
