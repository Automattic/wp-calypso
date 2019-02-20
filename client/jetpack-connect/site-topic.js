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
import withTrackingTool from 'lib/analytics/with-tracking-tool';
import WpcomColophon from 'components/wpcom-colophon';
import { getSelectedSiteId } from 'state/ui/selectors';
import { saveSiteVertical } from 'state/jetpack-connect/actions';

class JetpackSiteTopic extends Component {
	handleSubmit = ( { name, slug } ) => {
		const { siteId } = this.props;
		const siteVertical = name || slug || '';

		this.props.saveSiteVertical( siteId, siteVertical );

		// TODO: move to the next step
		// page.redirect( `/jetpack/connect/plans/${ siteSlug }` );
	};

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
	state => ( {
		siteId: getSelectedSiteId( state ),
	} ),
	{
		saveSiteVertical,
	}
);

export default flowRight(
	connectComponent,
	jetpackOnly,
	localize,
	withTrackingTool( 'HotJar' )
)( JetpackSiteTopic );
