/**
 * External dependencies
 */
import React, { Component } from 'react';
import page from 'page';
import { connect } from 'react-redux';
import { flowRight } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FormattedHeader from 'components/formatted-header';
import MainWrapper from './main-wrapper';
import SiteTopicForm from 'signup/steps/site-topic/form';
import WpcomColophon from 'components/wpcom-colophon';
import jetpackOnly from './jetpack-only';
import withTrackingTool from 'lib/analytics/with-tracking-tool';
import versionCompare from 'lib/version-compare';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import { getSiteOption } from 'state/sites/selectors';
import { saveSiteVertical } from 'state/jetpack-connect/actions';

class JetpackSiteTopic extends Component {
	handleSubmit = ( { name, slug } ) => {
		const { siteId, siteSlug } = this.props;
		const siteVertical = name || slug || '';

		this.props.saveSiteVertical( siteId, siteVertical );

		const jpVersion = this.props.siteJetpackVersion;
		if ( ! jpVersion ) {
			return null;
		}
		if ( versionCompare( jpVersion, 7.2 ) < 0 || jpVersion === '7.2-alpha' ) {
			page( `/jetpack/connect/user-type/${ siteSlug }` );
		} else {
			page( `/jetpack/connect/plans/${ siteSlug }` );
		}
	};

	render() {
		const { translate } = this.props;

		return (
			<MainWrapper isWide>
				<div className="jetpack-connect__step">
					<FormattedHeader
						headerText={ translate( 'Tell us about your website' ) }
						subHeaderText={ translate(
							"Enter a keyword and we'll start tailoring a site for you."
						) }
					/>

					<SiteTopicForm submitForm={ this.handleSubmit } />

					<WpcomColophon />
				</div>
			</MainWrapper>
		);
	}
}

const connectComponent = connect(
	state => {
		const siteId = getSelectedSiteId( state );
		return {
			siteId,
			siteJetpackVersion: getSiteOption( state, siteId, 'jetpack_version' ),
			siteSlug: getSelectedSiteSlug( state ),
		};
	},
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
