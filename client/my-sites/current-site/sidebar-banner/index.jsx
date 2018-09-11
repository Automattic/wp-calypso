/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import TrackComponentView from 'lib/analytics/track-component-view';
import { recordTracksEvent } from 'state/analytics/actions';
import { nudgeClickRequest } from 'state/sites/nudge-click/actions';

export class SidebarBanner extends Component {
	static defaultProps = {
		className: '',
		shouldNotifyBackend: false,
	};

	static propTypes = {
		className: PropTypes.string,
		ctaName: PropTypes.string,
		ctaText: PropTypes.string,
		icon: PropTypes.string,
		href: PropTypes.string,
		shouldNotifyBackend: PropTypes.bool,
		siteId: PropTypes.number,
		text: PropTypes.string,
		track: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
	};

	onClick = () => {
		const { ctaName, track, shouldNotifyBackend, siteId, nudgeClickRequest } = this.props;

		track( 'calypso_upgrade_nudge_cta_click', { cta_name: ctaName } );

		// Do any backend work after a nudge is clicked
		if ( shouldNotifyBackend ) {
			nudgeClickRequest( siteId, ctaName );
		}
	};

	render() {
		const { className, ctaName, ctaText, href, icon, text } = this.props;
		const classes = classnames( 'sidebar-banner', className );

		return (
			<div className={ classes }>
				<TrackComponentView
					eventName="calypso_upgrade_nudge_impression"
					eventProperties={ { cta_name: ctaName } }
				/>
				<a className="sidebar-banner__link" onClick={ this.onClick } href={ href }>
					<span className="sidebar-banner__icon-wrapper">
						<Gridicon className="sidebar-banner__icon" icon={ icon } size={ 18 } />
					</span>
					<span className="sidebar-banner__content">
						<span className="sidebar-banner__text">{ text }</span>
					</span>
					<span className="sidebar-banner__cta">{ ctaText }</span>
				</a>
			</div>
		);
	}
}

const mapStateToProps = null;
const mapDispatchToProps = {
	track: recordTracksEvent,
	nudgeClickRequest: nudgeClickRequest,
};

export default connect(
	mapStateToProps,
	mapDispatchToProps
)( localize( SidebarBanner ) );
