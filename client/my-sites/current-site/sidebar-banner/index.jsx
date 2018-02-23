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
import { abtest } from 'lib/abtest';

/**
 * Internal dependencies
 */
import TrackComponentView from 'lib/analytics/track-component-view';
import { recordTracksEvent } from 'state/analytics/actions';

export class SidebarBanner extends Component {
	static defaultProps = {
		className: '',
	};

	static propTypes = {
		className: PropTypes.string,
		ctaName: PropTypes.string,
		ctaText: PropTypes.string,
		icon: PropTypes.string,
		href: PropTypes.string,
		text: PropTypes.string,
		track: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
	};

	onClick = () => {
		const { ctaName, track } = this.props;
		track( 'calypso_upgrade_nudge_cta_click', { cta_name: ctaName } );
	};

	render() {
		const { className, ctaName, ctaText, href, icon, text } = this.props;
		const variation = abtest( 'redesignedSidebarBanner' );
		const classes = classnames(
			{
				'sidebar-banner': variation === 'oldBanner',
				'sidebar-banner-new': variation === 'newBanner',
			},
			className
		);

		return (
			<div className={ classes }>
				<TrackComponentView
					eventName="calypso_upgrade_nudge_impression"
					eventProperties={ { cta_name: ctaName } }
				/>
				<a className="sidebar-banner__link" onClick={ this.onClick } href={ href }>
					{ variation === 'oldBanner' && (
						<span className="sidebar-banner__icon-wrapper">
							<Gridicon className="sidebar-banner__icon" icon={ icon } size={ 18 } />
						</span>
					) }
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
const mapDispatchToProps = { track: recordTracksEvent };

export default connect( mapStateToProps, mapDispatchToProps )( localize( SidebarBanner ) );
