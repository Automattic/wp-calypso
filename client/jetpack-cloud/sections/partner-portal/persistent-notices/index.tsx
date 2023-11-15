import { Component } from 'react';
import { connect } from 'react-redux';
import Notice from 'calypso/components/notice';
import { removeJetpackManagePersistentNotice } from './actions';
import { getJetpackManagePersistentNotices } from './selectors';
import {
	JetpackManagePersistentNoticeActionOptions,
	JetpackManagePersistentNoticeRemovalActionCreator,
} from './types';

export interface JetpackPersistentNoticesProps {
	storeJetpackManagePersistentNotices: JetpackManagePersistentNoticeActionOptions[];
	removeJetpackManagePersistentNotice: JetpackManagePersistentNoticeRemovalActionCreator;
}

export class JetpackPersistentNotices extends Component< JetpackPersistentNoticesProps > {
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
	( state ) => ( {
		storeJetpackManagePersistentNotices: getJetpackManagePersistentNotices( state ),
	} ),
	{ removeJetpackManagePersistentNotice }
)( JetpackPersistentNotices );
