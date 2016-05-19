/**
 * External Dependencies
 */
import React from 'react';

/**
 * Internal Dependencies
 */
import analyticsMixin from 'lib/mixins/analytics';
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';
import support from 'lib/url/support';

const learnMoreLink = <a href={ support.COMPLETING_GOOGLE_APPS_SIGNUP } target="_blank" />,
	strong = <strong />;

const PendingGappsTosNotice = React.createClass( {
	mixins: [ analyticsMixin( 'domainManagement', 'googleApps' ) ],

	propTypes: {
		siteSlug: React.PropTypes.string.isRequired,
		domains: React.PropTypes.array.isRequired,
		section: React.PropTypes.string.isRequired
	},

	componentDidMount() {
		this.recordEvent( 'showPendingAccountNotice',
			{
				siteSlug: this.props.siteSlug,
				severity: this.getNoticeSeverity(),
				isMultipleDomains: this.props.domains.length > 1,
				section: this.props.section
			}
		);
	},

	getGappsLoginUrl( email, domain ) {
		return `https://accounts.google.com/AccountChooser?Email=${ email }&service=CPanel&continue=https%3A%2F%2Fadmin.google.com%2F${ domain }%2FAcceptTermsOfService%3Fcontinue%3Dhttps%3A%2F%2Fmail.google.com%2Fmail%2Fu%2F1`;
	},

	getNoticeSeverity() {
		const subscribedDaysAgo = days => {
			return domain => this.moment( domain.googleAppsSubscription.subscribedDate ).isBefore( this.moment().subtract( days, 'days' ) );
		};

		if ( this.props.domains.some( subscribedDaysAgo( 21 ) ) ) {
			return 'error';
		} else if ( this.props.domains.some( subscribedDaysAgo( 7 ) ) ) {
			return 'warning';
		}

		return 'info';
	},

	getExclamation( severity ) {
		const translationOptions = {
			context: 'Beginning of Gapps pending account notice',
			comment: 'Used as an exclamation in Gapps\' pending account notice'
		};

		switch ( severity ) {
			case 'warning':
				return this.translate( 'Attention!', translationOptions );

			case 'error':
				return this.translate( 'Urgent!', translationOptions );

			default:
				return this.translate( 'You\'re almost there!', translationOptions );
		}
	},

	generateLogInClickHandler( { domainName, user, severity, isMultipleDomains } ) {
		return () => {
			this.recordEvent( 'pendingAccountLogInClick', { siteSlug: this.props.siteSlug, domainName, user, severity, isMultipleDomains, section: this.props.section } );
		};
	},

	oneDomainNotice() {
		const severity = this.getNoticeSeverity(),
			exclamation = this.getExclamation( severity ),
			domainName = this.props.domains[0].name,
			users = this.props.domains[0].googleAppsSubscription.pendingUsers;

		return (
			<Notice
				status={ `is-${ severity }` }
				showDismiss={ false }
				key="pending-gapps-tos-acceptance-domain"
				text={ this.translate(
					'%(exclamation)s To activate your email {{strong}}%(emails)s{{/strong}}, please log in to Google Apps and finish setting it up. {{learnMoreLink}}Learn More{{/learnMoreLink}}',
					'%(exclamation)s To activate your emails {{strong}}%(emails)s{{/strong}}, please log in to Google Apps and finish setting it up. {{learnMoreLink}}Learn More{{/learnMoreLink}}',
					{
						count: users.length,
						args: { exclamation, emails: users.join( ', ' ) },
						components: { learnMoreLink, strong }
					}
				) }>
				<NoticeAction
					href={ this.getGappsLoginUrl( users[0], domainName ) }
					onClick={ this.generateLogInClickHandler( { domainName, user: users[0], severity, isMultipleDomains: false } ) }
					external>
						{ this.translate( 'Log in' ) }
				</NoticeAction>
			</Notice>
		);
	},

	multipleDomainsNotice() {
		const severity = this.getNoticeSeverity(),
			exclamation = this.getExclamation( severity );

		return (
			<Notice
				status={ `is-${ severity }` }
				showDismiss={ false }
				key="pending-gapps-tos-acceptance-domains">
				{ this.translate(
					'%(exclamation)s To activate your new email addresses, please log in to Google Apps and finish setting them up. {{learnMoreLink}}Learn more{{/learnMoreLink}}',
					{
						args: { exclamation },
						components: { learnMoreLink }
					}
				) }
				<ul>{
					this.props.domains.map( ( { name: domainName, googleAppsSubscription: { pendingUsers: users } } ) => {
						return <li key={ `pending-gapps-tos-acceptance-domain-${ domainName }` }>
						<strong>{ users.join( ', ' ) } </strong>
							<a
								href={ this.getGappsLoginUrl( users[0], domainName ) }
								onClick={ this.generateLogInClickHandler( { domainName, user: users[0], severity, isMultipleDomains: true } ) }
								target="_blank">
									{ this.translate( 'Log in' ) }
							</a>
						</li>;
					} )
				}</ul>
			</Notice>
		);
	},

	render() {
		switch ( this.props.domains.length ) {
			case 0:
				return null;

			case 1:
				return this.oneDomainNotice();

			default:
				return this.multipleDomainsNotice();
		}
	},
} );

export default PendingGappsTosNotice;
