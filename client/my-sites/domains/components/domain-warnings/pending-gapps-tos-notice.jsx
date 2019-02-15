/** @format */

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
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';
import { COMPLETING_GOOGLE_APPS_SIGNUP } from 'lib/url/support';
import { emailManagement } from 'my-sites/email/paths';
import PendingGappsTosNoticeMultipleDomainListItem from './pending-gapps-tos-notice-multiple-domain-list-item';
import { composeAnalytics, recordGoogleEvent, recordTracksEvent } from 'state/analytics/actions';
import { getLoginUrlWithTOSRedirect } from 'lib/google-apps';

const learnMoreLink = (
	<a href={ COMPLETING_GOOGLE_APPS_SIGNUP } target="_blank" rel="noopener noreferrer" />
);
const strong = <strong />;

class PendingGappsTosNotice extends React.PureComponent {
	static propTypes = {
		siteSlug: PropTypes.string.isRequired,
		domains: PropTypes.array.isRequired,
		section: PropTypes.string.isRequired,
		isCompact: PropTypes.bool,
	};

	static defaultProps = {
		isCompact: false,
	};

	componentDidMount() {
		this.props.showPendingAccountNotice( {
			siteSlug: this.props.siteSlug,
			severity: this.getNoticeSeverity(),
			isMultipleDomains: this.props.domains.length > 1,
			section: this.props.section,
		} );
	}

	getNoticeSeverity() {
		const { moment } = this.props;

		const subscribedDaysAgo = days => {
			return domain =>
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

	recordLogInClick = ( domainName, user, isMultipleDomains ) => {
		this.props.pendingAccountLogInClick( {
			domainName,
			isMultipleDomains,
			user,
			severity: this.getNoticeSeverity(),
			section: this.props.section,
			siteSlug: this.props.siteSlug,
		} );
	};

	logInClickHandlerOneDomain = () => {
		this.recordLogInClick(
			this.props.domains[ 0 ].name,
			this.props.domains[ 0 ].googleAppsSubscription.pendingUsers[ 0 ],
			false
		);
	};

	logInClickHandlerMultipleDomains = ( domainName, user ) => {
		this.recordLogInClick( domainName, user, true );
	};

	fixClickHandler = () => {
		this.props.fixPendingEmailSiteNoticeClick( this.props.siteSlug );
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
				<NoticeAction href={ href } onClick={ this.fixClickHandler }>
					{ this.props.translate( 'Fix' ) }
				</NoticeAction>
			</Notice>
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
				showDismiss={ false }
				key="pending-gapps-tos-acceptance-domain"
				text={ translate(
					'%(exclamation)s To activate your email {{strong}}%(emails)s{{/strong}}, please log in to G Suite ' +
						'and finish setting it up. {{learnMoreLink}}Learn More{{/learnMoreLink}}',
					'%(exclamation)s To activate your emails {{strong}}%(emails)s{{/strong}}, please log in to G Suite ' +
						'and finish setting it up. {{learnMoreLink}}Learn More{{/learnMoreLink}}',
					{
						count: users.length,
						args: { exclamation, emails: users.join( ', ' ) },
						components: { learnMoreLink, strong },
					}
				) }
			>
				<NoticeAction
					href={ getLoginUrlWithTOSRedirect( users[ 0 ], domainName ) }
					onClick={ this.logInClickHandlerOneDomain }
					external
				>
					{ translate( 'Log in' ) }
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
					'%(exclamation)s To activate your new email addresses, please log in to G Suite ' +
						'and finish setting them up. {{learnMoreLink}}Learn more{{/learnMoreLink}}',
					{
						args: { exclamation },
						components: { learnMoreLink },
					}
				) }
				<ul>
					{ this.props.domains.map(
						( { name: domainName, googleAppsSubscription: { pendingUsers: users } } ) => {
							return (
								<li key={ `pending-gapps-tos-acceptance-domain-${ domainName }` }>
									<strong>{ users.join( ', ' ) } </strong>
									<PendingGappsTosNoticeMultipleDomainListItem
										href={ getLoginUrlWithTOSRedirect( users[ 0 ], domainName ) }
										domainName={ domainName }
										user={ users[ 0 ] }
										onClick={ this.logInClickHandlerMultipleDomains }
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

const pendingAccountLogInClick = ( {
	siteSlug,
	domainName,
	user,
	severity,
	isMultipleDomains,
	section,
} ) =>
	composeAnalytics(
		recordGoogleEvent(
			'Domain Management',
			`Clicked "Log in" link in G Suite pending ToS notice in ${ section }`,
			'Domain Name',
			domainName
		),
		recordTracksEvent( 'calypso_domain_management_gsuite_pending_account_log_in_click', {
			site_slug: siteSlug,
			domain_name: domainName,
			user,
			severity,
			is_multiple_domains: isMultipleDomains,
			section,
		} )
	);

const showPendingAccountNotice = ( { siteSlug, severity, isMultipleDomains, section } ) =>
	composeAnalytics(
		recordGoogleEvent( 'Domain Management', 'Showed pending account notice', 'Site', siteSlug ),
		recordTracksEvent( 'calypso_domain_management_gsuite_pending_account_notice_show', {
			site_slug: siteSlug,
			severity,
			is_multiple_domains: isMultipleDomains,
			section,
		} )
	);

const fixPendingEmailSiteNoticeClick = siteSlug =>
	composeAnalytics(
		recordGoogleEvent(
			'Domain Management',
			'Clicked "Fix" link in site notice for email requiring action',
			'Site',
			siteSlug
		),
		recordTracksEvent( 'calypso_domain_management_gsuite_site_fix_click', {
			site_slug: siteSlug,
		} )
	);

export default connect(
	null,
	{
		fixPendingEmailSiteNoticeClick,
		pendingAccountLogInClick,
		showPendingAccountNotice,
	}
)( localize( PendingGappsTosNotice ) );
