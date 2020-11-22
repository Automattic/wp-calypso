/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import Notice from 'calypso/components/notice';
import NoticeAction from 'calypso/components/notice/notice-action';
import { withLocalizedMoment } from 'calypso/components/localized-moment';
import { emailManagement } from 'calypso/my-sites/email/paths';
import PendingGSuiteTosNoticeAction from './pending-gsuite-tos-notice-action';
import {
	composeAnalytics,
	recordGoogleEvent,
	recordTracksEvent,
} from 'calypso/state/analytics/actions';

/**
 * Style dependencies
 */
import './style.scss';
const strong = <strong />;

class PendingGSuiteTosNotice extends React.PureComponent {
	static propTypes = {
		siteSlug: PropTypes.string.isRequired,
		domains: PropTypes.array.isRequired,
		section: PropTypes.string.isRequired,
		isCompact: PropTypes.bool,
		showDomainStatusNotice: PropTypes.bool,
	};

	static defaultProps = {
		isCompact: false,
		showDomainStatusNotice: false,
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

	getExclamation( severity ) {
		const { translate } = this.props;
		const translationOptions = {
			context: 'Beginning of Gapps pending account notice',
			comment: "Used as an exclamation in Gapps' pending account notice",
		};

		switch ( severity ) {
			case 'warning':
				return translate( 'Attention!', translationOptions );

			case 'error':
				return translate( 'Urgent!', translationOptions );

			default:
				return translate( "You're almost there!", translationOptions );
		}
	}

	finishSetupClickHandler = () => {
		this.props.finishSetupNoticeClick( this.props.siteSlug );
	};

	compactNotice() {
		const severity = this.getNoticeSeverity();
		const href =
			this.props.domains.length === 1
				? emailManagement( this.props.siteSlug, this.props.domains[ 0 ].name )
				: emailManagement( this.props.siteSlug );

		return (
			<Notice
				isCompact={ this.props.isCompact }
				status={ `is-${ severity }` }
				showDismiss={ false }
				key="pending-gapps-tos-acceptance-domain-compact"
				text={ this.props.translate( 'Email requires action', 'Emails require action', {
					count: this.props.domains.length,
				} ) }
			>
				<NoticeAction href={ href } onClick={ this.finishSetupClickHandler }>
					{ this.props.translate( 'Finish Setup' ) }
				</NoticeAction>
			</Notice>
		);
	}

	domainStatusNotice() {
		const { domains, translate } = this.props;
		const domainName = domains[ 0 ].name;
		const users = domains[ 0 ].googleAppsSubscription.pendingUsers;
		const emails = users.join( ', ' );

		const button = (
			<PendingGSuiteTosNoticeAction
				domainName={ domainName }
				section={ this.props.section }
				siteSlug={ this.props.siteSlug }
				user={ users[ 0 ] }
				isCompact={ false }
				cta={ translate( 'Finish Setup' ) }
			/>
		);

		return (
			<>
				<p>
					{ translate(
						'Your mailbox {{strong}}%(emails)s{{/strong}} is almost ready! Complete the setup to activate your new email address.',
						'Your mailboxes {{strong}}%(emails)s{{/strong}} are almost ready! Complete the setup to activate your new email addresses.',
						{
							count: users.length,
							args: { emails },
							comment:
								'%(emails)s will be a list of email addresses separated by a comma, ' +
								'e.g. test@example.com, test2@example.com',
							components: { strong },
						}
					) }
				</p>

				{ button }
			</>
		);
	}

	oneDomainNotice() {
		const { translate } = this.props;
		const severity = this.getNoticeSeverity();
		const exclamation = this.getExclamation( severity );
		const domainName = this.props.domains[ 0 ].name;
		const users = this.props.domains[ 0 ].googleAppsSubscription.pendingUsers;

		return (
			<Notice
				isCompact={ this.props.isCompact }
				status={ `is-${ severity }` }
				className="domain-warnings__pending-g-suite-tos-notice"
				showDismiss={ false }
				key="pending-gapps-tos-acceptance-domain"
				text={ translate(
					'%(exclamation)s To activate your email {{strong}}%(emails)s{{/strong}}, click "Finish Setup".',
					'%(exclamation)s To activate your emails {{strong}}%(emails)s{{/strong}}, click "Finish Setup".',
					{
						count: users.length,
						args: { exclamation, emails: users.join( ', ' ) },
						components: { strong },
					}
				) }
			>
				<NoticeAction>
					<PendingGSuiteTosNoticeAction
						domainName={ domainName }
						section={ this.props.section }
						siteSlug={ this.props.siteSlug }
						user={ users[ 0 ] }
					/>
				</NoticeAction>
			</Notice>
		);
	}

	multipleDomainsNotice() {
		const { translate } = this.props;
		const severity = this.getNoticeSeverity();
		const exclamation = this.getExclamation( severity );

		return (
			<Notice
				status={ `is-${ severity }` }
				showDismiss={ false }
				key="pending-gapps-tos-acceptance-domains"
			>
				{ translate(
					'%(exclamation)s To activate your new email addresses, click "Finish Setup".',
					{
						args: { exclamation },
					}
				) }

				<ul>
					{ this.props.domains.map(
						( { name: domainName, googleAppsSubscription: { pendingUsers: users } } ) => {
							return (
								<li key={ `pending-gapps-tos-acceptance-domain-${ domainName }` }>
									<strong>{ domainName } </strong>

									<PendingGSuiteTosNoticeAction
										domainName={ domainName }
										section={ this.props.section }
										siteSlug={ this.props.siteSlug }
										user={ users[ 0 ] }
									/>
								</li>
							);
						}
					) }
				</ul>
			</Notice>
		);
	}

	render() {
		if ( this.props.showDomainStatusNotice ) {
			return this.domainStatusNotice();
		}

		if ( this.props.isCompact ) {
			return this.compactNotice();
		}

		switch ( this.props.domains.length ) {
			case 0:
				return null;

			case 1:
				return this.oneDomainNotice();

			default:
				return this.multipleDomainsNotice();
		}
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
