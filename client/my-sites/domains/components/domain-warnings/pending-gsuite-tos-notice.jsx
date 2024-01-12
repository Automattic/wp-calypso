import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { withLocalizedMoment } from 'calypso/components/localized-moment';
import Notice from 'calypso/components/notice';
import NoticeAction from 'calypso/components/notice/notice-action';
import { getEmailManagementPath } from 'calypso/my-sites/email/paths';
import {
	composeAnalytics,
	recordGoogleEvent,
	recordTracksEvent,
} from 'calypso/state/analytics/actions';

import './style.scss';

class PendingGSuiteTosNotice extends PureComponent {
	static propTypes = {
		siteSlug: PropTypes.string.isRequired,
		domains: PropTypes.array.isRequired,
		section: PropTypes.string.isRequired,
	};

	componentDidMount() {
		this.props.recordShowPendingAccountNotice( {
			siteSlug: this.props.siteSlug,
			severity: this.getNoticeSeverity(),
			isMultipleDomains: this.props.domains.length > 1,
			section: this.props.section,
		} );
	}

	getNoticeSeverity() {
		const { moment } = this.props;

		const subscribedDaysAgo = ( days ) => {
			return ( domain ) =>
				moment( domain.googleAppsSubscription.subscribedDate ).isBefore(
					moment().subtract( days, 'days' )
				);
		};

		if ( this.props.domains.some( subscribedDaysAgo( 21 ) ) ) {
			return 'error';
		} else if ( this.props.domains.some( subscribedDaysAgo( 7 ) ) ) {
			return 'warning';
		}

		return 'info';
	}

	finishSetupClickHandler = () => {
		this.props.finishSetupNoticeClick( this.props.siteSlug );
	};

	render() {
		const href =
			this.props.domains.length === 1
				? getEmailManagementPath( this.props.siteSlug, this.props.domains[ 0 ].name )
				: getEmailManagementPath( this.props.siteSlug );

		return (
			<Notice
				isCompact
				status={ `is-${ this.getNoticeSeverity() }` }
				showDismiss={ false }
				text={ this.props.translate( 'Email requires action', 'Emails require action', {
					count: this.props.domains.length,
				} ) }
			>
				<NoticeAction href={ href } onClick={ this.finishSetupClickHandler }>
					{ this.props.translate( 'Go' ) }
				</NoticeAction>
			</Notice>
		);
	}
}

const recordShowPendingAccountNotice = ( { siteSlug, severity, isMultipleDomains, section } ) =>
	composeAnalytics(
		recordGoogleEvent( 'Domain Management', 'Showed pending account notice', 'Site', siteSlug ),
		recordTracksEvent( 'calypso_domain_management_gsuite_pending_account_notice_show', {
			site_slug: siteSlug,
			severity,
			is_multiple_domains: isMultipleDomains,
			section,
		} )
	);

const finishSetupNoticeClick = ( siteSlug ) =>
	composeAnalytics(
		recordGoogleEvent(
			'Domain Management',
			'Clicked "Finish Setup" link in site notice for email requiring action',
			'Site',
			siteSlug
		),
		recordTracksEvent( 'calypso_domain_management_gsuite_site_fix_click', {
			site_slug: siteSlug,
		} )
	);

export default connect( null, {
	finishSetupNoticeClick,
	recordShowPendingAccountNotice,
} )( localize( withLocalizedMoment( PendingGSuiteTosNotice ) ) );
