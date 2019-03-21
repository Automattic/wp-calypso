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
import jetpackOnly from '../jetpack-only';
import MainWrapper from '../main-wrapper';
import UserTypeForm from './form';
import withTrackingTool from 'lib/analytics/with-tracking-tool';
import WpcomColophon from 'components/wpcom-colophon';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import { saveSiteUserType } from 'state/jetpack-connect/actions';

class JetpackUserType extends Component {
	handleSubmit = userType => {
		const { siteId, siteSlug } = this.props;

		this.props.saveSiteUserType( siteId, userType );

		page( `/jetpack/connect/plans/${ siteSlug }` );
	};

	render() {
		const { translate } = this.props;

		return (
			<MainWrapper isWide>
				<div className="user-type__connect-step">
					<FormattedHeader
						headerText={ translate( 'Are you setting up this site for yourself or someone else?' ) }
					/>
					<UserTypeForm submitForm={ this.handleSubmit } />
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
		saveSiteUserType,
	}
);

export default flowRight(
	connectComponent,
	jetpackOnly,
	localize,
	withTrackingTool( 'HotJar' )
)( JetpackUserType );
