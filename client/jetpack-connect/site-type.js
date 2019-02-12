/**
 * External dependencies
 */
import React, { Component } from 'react';
import page from 'page';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FormattedHeader from 'components/formatted-header';
import MainWrapper from './main-wrapper';
import SiteTypeForm from 'signup/steps/site-type/form';
import { loadTrackingTool } from 'state/analytics/actions';
import { isJetpackSite } from 'state/sites/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';

class JetpackSiteType extends Component {
	componentDidMount() {
		this.verifyJetpackSite();

		this.props.loadTrackingTool( 'HotJar' );
	}

	verifyJetpackSite() {
		const { notJetpack, siteId, siteSlug } = this.props;
		if ( notJetpack ) {
			// Redirect to /plans/:site if this is not a Jetpack site
			page.redirect( `/plans/${ siteSlug }` );
		} else if ( ! siteId ) {
			// Redirect to /jetpack/connect if this is not a valid connected site
			page.redirect( `/jetpack/connect` );
		}
	}

	handleSubmit() {
		// @TODO: implement saving logic
	}

	render() {
		const { notJetpack, siteId, translate } = this.props;

		if ( notJetpack || ! siteId ) {
			return null;
		}

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
				</div>
			</MainWrapper>
		);
	}
}

export default connect(
	state => {
		const siteId = getSelectedSiteId( state );

		return {
			notJetpack: siteId && ! isJetpackSite( state, siteId ),
			siteId,
			siteSlug: getSelectedSiteSlug( state ),
		};
	},
	{
		loadTrackingTool,
	}
)( localize( JetpackSiteType ) );
