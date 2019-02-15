/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { flowRight } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FormattedHeader from 'components/formatted-header';
import jetpackOnly from './jetpack-only';
import MainWrapper from './main-wrapper';
import SiteTopicForm from 'signup/steps/site-topic/form';
import WpcomColophon from 'components/wpcom-colophon';
import { loadTrackingTool } from 'state/analytics/actions';

class JetpackSiteTopic extends Component {
	componentDidMount() {
		this.props.loadTrackingTool( 'HotJar' );
	}

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

const connectComponent = connect(
	null,
	{
		loadTrackingTool,
	}
);

export default flowRight(
	connectComponent,
	jetpackOnly,
	localize
)( JetpackSiteTopic );
