import { localize } from 'i18n-calypso';
import { Component } from 'react';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import './style.scss';

class InviteFormHeader extends Component {
	static displayName = 'InviteFormHeader';

	clickedSiteLink = () => {
		recordTracksEvent( 'calypso_invite_accept_form_header_site_link_click' );
	};

	getSiteLink = () => {
		const { site } = this.props;

		if ( ! site ) {
			return null;
		}

		return (
			<a href={ site.URL } onClick={ this.clickedSiteLink }>
				{ site.title }
			</a>
		);
	};

	getLoggedOutTitleForInvite = () => {
		let title = '';
		const { role, forceMatchingEmail, knownUser } = this.props;

		if ( forceMatchingEmail && knownUser ) {
			return this.props.translate( 'Sign in to continue:' );
		}

		switch ( role ) {
			case 'administrator':
				title = this.props.translate( 'Sign up to start managing {{siteLink/}}', {
					components: {
						siteLink: this.getSiteLink(),
					},
				} );
				break;
			case 'editor':
				title = this.props.translate( 'Sign up to start editing {{siteLink/}}', {
					components: {
						siteLink: this.getSiteLink(),
					},
				} );
				break;
			case 'author':
				title = this.props.translate( 'Sign up to start writing for {{siteLink/}}', {
					components: {
						siteLink: this.getSiteLink(),
					},
				} );
				break;
			case 'contributor':
				title = this.props.translate( 'Sign up to start contributing to {{siteLink/}}', {
					components: {
						siteLink: this.getSiteLink(),
					},
				} );
				break;
			case 'subscriber':
				title = this.props.translate( 'Sign up to start your subscription to {{siteLink/}}', {
					components: {
						siteLink: this.getSiteLink(),
					},
				} );
				break;
			case 'viewer':
				title = this.props.translate( 'Sign up to begin viewing {{siteLink/}}', {
					components: {
						siteLink: this.getSiteLink(),
					},
				} );
				break;
			case 'follower':
				title = this.props.translate(
					'Sign up to start following {{siteLink/}} in the WordPress.com Reader',
					{
						components: {
							siteLink: this.getSiteLink(),
						},
					}
				);
				break;
			default:
				title = this.props.translate(
					'Sign up to join {{siteLink/}} as: {{strong}}%(siteRole)s{{/strong}}',
					{
						args: {
							siteRole: role,
						},
						components: {
							siteLink: this.getSiteLink(),
							strong: <strong />,
						},
					}
				);
		}

		return title;
	};

	getLoggedInTitleForInvite = () => {
		let title = '';

		const { role } = this.props;

		switch ( role ) {
			case 'administrator':
				title = this.props.translate( 'Start managing{{br/}}{{siteLink/}}', {
					components: {
						siteLink: this.getSiteLink(),
						br: <br />,
					},
				} );
				break;
			case 'editor':
				title = this.props.translate( 'Start editing{{br/}}{{siteLink/}}', {
					components: {
						siteLink: this.getSiteLink(),
						br: <br />,
					},
				} );
				break;
			case 'author':
				title = this.props.translate( 'Start writing for{{br/}}{{siteLink/}}', {
					components: {
						siteLink: this.getSiteLink(),
						br: <br />,
					},
				} );
				break;
			case 'contributor':
				title = this.props.translate( 'Start contributing to{{br/}}{{siteLink/}}', {
					components: {
						siteLink: this.getSiteLink(),
						br: <br />,
					},
				} );
				break;
			case 'subscriber':
				title = this.props.translate(
					'Start following{{br/}}{{siteLink/}}{{br/}}in the WordPress.com Reader',
					{
						components: {
							siteLink: this.getSiteLink(),
							br: <br />,
						},
					}
				);
				break;
			case 'viewer':
				title = this.props.translate( 'Begin viewing{{br/}}{{siteLink/}}', {
					components: {
						siteLink: this.getSiteLink(),
						br: <br />,
					},
				} );
				break;
			case 'follower':
				title = this.props.translate( 'Start following{{br/}}{{siteLink/}}', {
					components: {
						siteLink: this.getSiteLink(),
						br: <br />,
					},
				} );
				break;
			default:
				title = this.props.translate(
					'Join{{br/}}{{siteLink/}}{{br/}}{{span}}as: {{strong}}%(siteRole)s{{/strong}}{{/span}}',
					{
						args: {
							siteRole: role,
						},
						components: {
							siteLink: this.getSiteLink(),
							br: <br />,
							strong: <strong />,
							span: <span />,
						},
					}
				);
		}

		return title;
	};

	getExplanationForInvite = () => {
		const { role, site, translate } = this.props;
		const siteName = site.domain || '';

		let explanation = '';
		switch ( role ) {
			case 'administrator':
				explanation = translate(
					'As an administrator, you will be able to manage all aspects of %(site)s.',
					{
						args: {
							site: siteName || '',
						},
					}
				);
				break;
			case 'editor':
				explanation = translate(
					'As an editor, you will be able to publish and manage your own posts and the posts of others, as well as upload media.'
				);
				break;
			case 'author':
				explanation = translate(
					'As an author, you will be able to publish and edit your own posts as well as upload media.'
				);
				break;
			case 'contributor':
				explanation = translate(
					'As a contributor, you will be able to write and manage your own posts, but you will not be able to publish.'
				);
				break;
			case 'subscriber':
				explanation = translate(
					'As a viewer, you will be able to manage your profile on %(site)s.',
					{
						args: {
							site: siteName || '',
						},
					}
				);
				break;
			case 'viewer':
				explanation = translate(
					'As a viewer, you will be able to view the private site %(site)s.',
					{
						args: {
							site: siteName || '',
						},
					}
				);
				break;
			case 'follower':
				explanation = translate(
					'As a follower, you can read the latest posts from %(site)s in the WordPress.com Reader.',
					{
						args: {
							site: siteName || '',
						},
					}
				);
				break;
		}

		return explanation;
	};

	render() {
		const roleExplanation = this.getExplanationForInvite();
		return (
			<div className="invite-form-header">
				<h3 className="invite-form-header__title">
					{ this.props.user ? this.getLoggedInTitleForInvite() : this.getLoggedOutTitleForInvite() }
				</h3>
				{ roleExplanation && (
					<p className="invite-form-header__explanation">{ roleExplanation }</p>
				) }
			</div>
		);
	}
}

export default localize( InviteFormHeader );
