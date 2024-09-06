import { Gridicon } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { localize } from 'i18n-calypso';
import { includes } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';

/**
 * Module constants
 */
/**
 * List of services that we provide tips for.
 *
 * When adding tips for more services, please update the list in addition to adding
 * a method with the tip's content.
 * @type {string[]}
 */
const SERVICES_WITH_TIPS = [ 'instagram', 'google_plus' ];
/**
 * List of services we provide tips for, only if the site is connected to Jetpack.
 * @type {string[]}
 */
const JETPACK_SERVICES_WITH_TIPS = SERVICES_WITH_TIPS.concat( [ 'facebook', 'twitter' ] );

class SharingServiceTip extends Component {
	static propTypes = {
		service: PropTypes.object.isRequired,
		translate: PropTypes.func,
		hasJetpack: PropTypes.bool,
		site: PropTypes.object,
	};

	getSharingButtonsLink() {
		if ( this.props.site ) {
			return isJetpackCloud()
				? 'https://jetpack.com/redirect/?source=calypso-marketing-sharing-buttons&site=' +
						this.props.site.slug
				: '/sharing/buttons/' + this.props.site.slug;
		}
		return localizeUrl( 'https://wordpress.com/support/sharing/' );
	}

	facebook() {
		return this.props.translate(
			'You can also add a {{likeBoxLink}}Like Box{{/likeBoxLink}}, a {{shareButtonLink}}share button{{/shareButtonLink}}, or {{embedLink}}embed{{/embedLink}} your page or profile on your site.',
			{
				components: {
					likeBoxLink: (
						<a
							href={ localizeUrl(
								'https://wordpress.com/support/facebook-integration/#facebook-like-box'
							) }
						/>
					),
					shareButtonLink: <a href={ this.getSharingButtonsLink() } />,
					embedLink: (
						<a
							href={ localizeUrl(
								'https://wordpress.com/support/facebook-integration/facebook-embeds/'
							) }
						/>
					),
				},
				context: 'Sharing: Tip in settings',
			}
		);
	}

	twitter() {
		return this.props.translate(
			'You can also add a {{widgetLink}}Twitter Timeline Widget{{/widgetLink}} to display any public timeline on your site.',
			{
				components: {
					widgetLink: (
						<a
							href={ localizeUrl(
								'https://wordpress.com/support/widgets/twitter-timeline-widget/'
							) }
						/>
					),
				},
				context: 'Sharing: Tip in settings',
			}
		);
	}

	instagram() {
		return this.props.translate(
			'You can also add the {{widgetLink}}Latest Instagram Posts block{/widgetLink}} to display your latest Instagram photos on your site.',
			{
				components: {
					widgetLink: (
						<a
							href={ localizeUrl(
								'https://wordpress.com/support/instagram/#embed-a-feed-of-instagram-posts'
							) }
						/>
					),
				},
				context: 'Sharing: Tip in settings',
			}
		);
	}

	google_plus() {
		return null;
	}

	render() {
		const { service } = this.props;
		if (
			! includes(
				this.props.hasJetpack ? JETPACK_SERVICES_WITH_TIPS : SERVICES_WITH_TIPS,
				service.ID
			) ||
			'google_plus' === service.ID
		) {
			return <div className="connections__sharing-service-tip" />;
		}

		return (
			<div className="connections__sharing-service-tip">
				<Gridicon icon="info" size={ 18 } />
				{ this[ service.ID ]() }
			</div>
		);
	}
}

export default connect( ( state ) => ( {
	site: getSelectedSite( state ),
	hasJetpack: ! isJetpackCloud() || isJetpackSite( state, getSelectedSiteId( state ) ),
} ) )( localize( SharingServiceTip ) );
