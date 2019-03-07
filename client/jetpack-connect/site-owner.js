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
import SiteOwnerForm from 'signup/steps/site-owner/form';
import withTrackingTool from 'lib/analytics/with-tracking-tool';
import WpcomColophon from 'components/wpcom-colophon';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import { saveSiteVertical } from 'state/jetpack-connect/actions';

class JetpackSiteOwner extends Component {
	handleSubmit = ( { name, slug } ) => {
		const { siteId, siteSlug } = this.props;
		const siteVertical = name || slug || '';

		this.props.saveSiteVertical( siteId, siteVertical );

		page.redirect( `/jetpack/connect/plans/${ siteSlug }` );
	};

	render() {
		const { translate } = this.props;

		return (
			<MainWrapper isWide>
				<div className="jetpack-connect__step">
					<FormattedHeader
						headerText={ translate( 'Are you setting up this site for yourself or someone else?' ) }
					/>
					<SiteOwnerForm submitForm={ this.handleSubmit } />
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
		saveSiteVertical,
	}
);

export default flowRight(
	connectComponent,
	jetpackOnly,
	localize,
	withTrackingTool( 'HotJar' )
)( JetpackSiteOwner );
