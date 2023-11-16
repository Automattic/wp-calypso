import { Component } from 'react';
import { connect } from 'react-redux';
import Notice from 'calypso/components/notice';
import { getCurrentPartner } from 'calypso/state/partner-portal/partner/selectors';
import { Partner, PartnerPortalStore } from 'calypso/state/partner-portal/types';
import {
	removeJetpackManagePersistentNotice,
	warningPartnerPortalPersistentNotice,
} from './actions';
import { getJetpackManagePersistentNotices } from './selectors';
import {
	JetpackManagePersistentNoticeActionOptions,
	JetpackManagePersistentNoticeRemovalActionCreator,
	JetpackManagePersistentNoticeActionCreator,
	JetpackManagePersistentNoticeId,
	JetpackManagePersistentNoticeOptions,
} from './types';

export interface JetpackPersistentNoticesProps {
	storeJetpackManagePersistentNotices: JetpackManagePersistentNoticeActionOptions[];
	removeJetpackManagePersistentNotice: JetpackManagePersistentNoticeRemovalActionCreator;
	warningPartnerPortalPersistentNotice: JetpackManagePersistentNoticeActionCreator;
	partner: Partner | null;
}

export class JetpackPersistentNotices extends Component< JetpackPersistentNoticesProps > {
	componentWillMount() {
		if ( this.props.partner ) {
			this.props.warningPartnerPortalPersistentNotice(
				'unpaid-invoice-notice',
				"The payment for your [month] invoice didn't go through. Please take a moment to complete payment.",
				{
					linkText: 'View Invoice',
					linkUrl: '/partner-portal/invoices',
				}
			);
		}
	}

	componentDidMount() {
		if ( this.props.partner ) {
			this.props.warningPartnerPortalPersistentNotice(
				'unpaid-invoice-notice',
				"The payment for your [month] invoice didn't go through. Please take a moment to complete payment.",
				{
					linkText: 'View Invoice',
					linkUrl: '/partner-portal/invoices',
				}
			);
		}
	}

	render() {
		const noticesList = this.props.storeJetpackManagePersistentNotices.map( function ( notice ) {
			return (
				<Notice
					{ ...notice }
					key={ `persistent-notice-${ notice.noticeId }` }
					showDismiss={ false }
					text={ notice.text }
				>
					<a href={ notice.linkUrl } className="notice__link">
						{ notice.linkText }
					</a>
				</Notice>
			);
		}, this );

		if ( ! noticesList.length ) {
			return null;
		}

		return <div>{ noticesList }</div>;
	}
}

export default connect(
	( state: PartnerPortalStore ) => ( {
		storeJetpackManagePersistentNotices: getJetpackManagePersistentNotices( state ),
		// Refreshes the component when the partner changes
		// To avoid showing the notice when the partner is not loaded yet
		partner: getCurrentPartner( state ),
	} ),
	( dispatch ) => ( {
		removeJetpackManagePersistentNotice: ( id: JetpackManagePersistentNoticeId ) =>
			dispatch( removeJetpackManagePersistentNotice( id ) ),
		warningPartnerPortalPersistentNotice: (
			id: string,
			message: string,
			noticeOptions?: JetpackManagePersistentNoticeOptions
		) => dispatch( warningPartnerPortalPersistentNotice( id, message, noticeOptions ) ),
	} )
)( JetpackPersistentNotices );
