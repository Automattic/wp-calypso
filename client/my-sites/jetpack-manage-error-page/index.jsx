/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { gaRecordEvent } from 'lib/analytics/ga';
import EmptyContent from 'components/empty-content';
import FeatureExample from 'components/feature-example';
import { getSiteSlug } from 'state/sites/selectors';

class JetpackManageErrorPage extends PureComponent {
	static actionCallbacks = {
		updateJetpack: 'actionCallbackUpdate',
	};

	actionCallbackUpdate = () => {
		gaRecordEvent( 'Jetpack', 'Update jetpack', 'Site', this.props.siteId );
	};

	getSettings() {
		const { siteSlug, template, translate } = this.props;
		const version = this.props.version || '3.4';
		const defaults = {
			updateJetpack: {
				title: translate( 'Your version of Jetpack is out of date.' ),
				line: translate( 'Jetpack %(version)s or higher is required to see this page.', {
					args: { version },
				} ),
				action: translate( 'Update Jetpack' ),
				illustration: null,
				actionURL: '../../plugins/jetpack/' + siteSlug,
				version,
			},
			noDomainsOnJetpack: {
				title: translate( 'Domains are not available for this site.' ),
				line: translate(
					'You can only purchase domains for sites hosted on WordPress.com at this time.'
				),
				action: translate( 'View Plans' ),
				actionURL: '/plans/' + ( siteSlug || '' ),
			},
			default: {},
		};
		return Object.assign( {}, defaults[ template ] || defaults.default, this.props );
	}

	render() {
		const settings = this.getSettings();
		if ( JetpackManageErrorPage.actionCallbacks[ this.props.template ] ) {
			settings.actionCallback = this[
				JetpackManageErrorPage.actionCallbacks[ this.props.template ]
			];
		}
		const featureExample = this.props.featureExample ? (
			<FeatureExample>{ this.props.featureExample }</FeatureExample>
		) : null;

		return (
			<div>
				<EmptyContent { ...settings } />
				{ featureExample }
			</div>
		);
	}
}

export default connect( ( state, { siteId } ) => ( {
	siteSlug: getSiteSlug( state, siteId ),
} ) )( localize( JetpackManageErrorPage ) );
