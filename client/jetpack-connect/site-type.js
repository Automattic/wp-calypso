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
import SiteTypeForm from 'signup/steps/site-type/form';
import withTrackingTool from 'lib/analytics/with-tracking-tool';
import WpcomColophon from 'components/wpcom-colophon';
import { getSelectedSiteId } from 'state/ui/selectors';
import { saveSiteType } from 'state/jetpack-connect/actions';

class JetpackSiteType extends Component {
	handleSubmit = siteType => {
		const { siteId } = this.props;

		this.props.saveSiteType( siteId, siteType );

		// TODO: move to the next step
		// page.redirect( `/jetpack/site-topic/${ siteSlug }` );
	};

	render() {
		const { translate } = this.props;

		return (
			<MainWrapper isWide>
				<div className="jetpack-connect__step">
					<FormattedHeader
						headerText={ translate(
							'Boost your WordPress site with Security, Performance, and Customization features all in one service.'
						) }
						subHeaderText={ translate(
							'To get started, tell us a little bit about your site goals.'
						) }
					/>

					<FormattedHeader headerText={ translate( 'What kind of site do you have?' ) } />

					<SiteTypeForm submitForm={ this.handleSubmit } />

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
		saveSiteType,
	}
);

export default flowRight(
	connectComponent,
	jetpackOnly,
	localize,
	withTrackingTool( 'HotJar' )
)( JetpackSiteType );
