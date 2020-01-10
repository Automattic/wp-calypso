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
import jetpackOnly from './jetpack-only';
import MainWrapper from './main-wrapper';
import SkipButton from './skip-button';
import SiteTypeForm from 'signup/steps/site-type/form';
import WpcomColophon from 'components/wpcom-colophon';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import { saveSiteType } from 'state/jetpack-connect/actions';
import { setSiteType } from 'state/signup/steps/site-type/actions';

class JetpackSiteType extends Component {
	goToNextStep = () => {
		const { siteSlug } = this.props;

		page( `/jetpack/connect/site-topic/${ siteSlug }` );
	};

	handleSubmit = siteType => {
		const { siteId } = this.props;

		this.props.saveSiteType( siteId, siteType );
		this.props.setSiteType( siteType );

		this.goToNextStep();
	};

	render() {
		const { translate } = this.props;

		return (
			<MainWrapper isWide>
				<div className="jetpack-connect__step">
					<FormattedHeader
						headerText={ translate( 'What type of site are you connecting to Jetpack?' ) }
						subHeaderText={ translate( "We'll use this to customize your Jetpack experience." ) }
					/>

					<SiteTypeForm
						showDescriptions={ false }
						showPurchaseRequired={ false }
						submitForm={ this.handleSubmit }
					/>

					<SkipButton
						onClick={ this.goToNextStep }
						tracksEventName="calypso_jpc_skipped_site_type"
					/>

					<WpcomColophon />
				</div>
			</MainWrapper>
		);
	}
}

const connectComponent = connect(
	state => ( {
		siteId: getSelectedSiteId( state ),
		siteSlug: getSelectedSiteSlug( state ),
	} ),
	{
		saveSiteType,
		setSiteType,
	}
);

export default flowRight( connectComponent, jetpackOnly, localize )( JetpackSiteType );
