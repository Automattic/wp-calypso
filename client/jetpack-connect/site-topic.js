/**
 * External dependencies
 */
import React, { Component } from 'react';
import { flowRight } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FormattedHeader from 'components/formatted-header';
import jetpackOnly from './jetpack-only';
import MainWrapper from './main-wrapper';
import SiteTopicForm from 'signup/steps/site-topic/form';
import withTrackingTool from 'lib/analytics/with-tracking-tool';
import WpcomColophon from 'components/wpcom-colophon';

class JetpackSiteTopic extends Component {
	handleSubmit() {
		// @TODO: implement saving logic
	}

	render() {
		const { translate } = this.props;

		return (
			<MainWrapper isWide>
				<div className="jetpack-connect__step">
					<FormattedHeader headerText={ translate( 'Tell us about your website' ) } />

					<SiteTopicForm submitForm={ this.handleSubmit } />

					<WpcomColophon />
				</div>
			</MainWrapper>
		);
	}
}

export default flowRight(
	jetpackOnly,
	localize,
	withTrackingTool( 'HotJar' )
)( JetpackSiteTopic );
