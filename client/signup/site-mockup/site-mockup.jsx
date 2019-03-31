/** @format */
/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { recordTracksEvent } from 'state/analytics/actions';
import { getSiteVerticalSlug } from 'state/signup/steps/site-vertical/selectors';
import SiteMockupComponent from 'components/site-mockup';

export class SiteMockup extends PureComponent {
	handleClick = () => this.props.handleClick( this.props.verticalSlug );

	render() {
		return <SiteMockupComponent { ...this.props } onClick={ this.handleClick } />;
	}
}

export default connect(
	state => ( { verticalSlug: getSiteVerticalSlug( state ) } ),
	( dispatch, ownProps ) => ( {
		handleClick: verticalSlug =>
			dispatch(
				recordTracksEvent( 'calypso_signup_site_preview_mockup_clicked', {
					size: ownProps.size,
					vertical_slug: verticalSlug,
					site_style: ownProps.siteStyle || 'professional',
				} )
			),
	} )
)( SiteMockup );
