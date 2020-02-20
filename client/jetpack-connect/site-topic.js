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
import SkipButton from './skip-button';
import SiteTopicForm from 'signup/steps/site-topic/form';
import WpcomColophon from 'components/wpcom-colophon';
import jetpackOnly from './jetpack-only';
import versionCompare from 'lib/version-compare';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import { getSiteOption } from 'state/sites/selectors';
import { saveSiteVertical } from 'state/jetpack-connect/actions';

class JetpackSiteTopic extends Component {
	goToNextStep = () => {
		const { siteSlug, siteJetpackVersion } = this.props;

		if ( ! siteJetpackVersion ) {
			return null;
		}
		if ( versionCompare( siteJetpackVersion, '7.2-alpha', '>=' ) ) {
			page( `/jetpack/connect/user-type/${ siteSlug }` );
		} else {
			page( `/jetpack/connect/plans/${ siteSlug }` );
		}
	};

	handleSubmit = ( { name, slug } ) => {
		const { siteId } = this.props;
		const siteVertical = name || slug || '';

		this.props.saveSiteVertical( siteId, siteVertical );

		this.goToNextStep();
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

					<SkipButton
						onClick={ this.goToNextStep }
						tracksEventName="calypso_jpc_skipped_site_topic"
					/>

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

export default flowRight( connectComponent, jetpackOnly, localize )( JetpackSiteTopic );
