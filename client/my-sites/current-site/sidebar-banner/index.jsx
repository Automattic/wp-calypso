/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import ReactDom from 'react-dom';
import { connect } from 'react-redux';
import classnames from 'classnames';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';
import { abtest } from 'lib/abtest';
import closest from 'component-closest';

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
		this.maybeFadeIn();
		const { ctaName, track } = this.props;
		track( 'calypso_upgrade_nudge_cta_click', { cta_name: ctaName } );
	};

	maybeFadeIn() {
		const { href } = this.props;
		const location = window.location;

		if ( href.indexOf( '/' ) !== 0 ) {
			return; // Not a relative location.
		} else if ( href !== location.pathname + location.search + location.hash ) {
			return; // Location is changing, no fade-in necessary.
		}

		const thisNode = ReactDom.findDOMNode( this );
		const layout = thisNode ? closest( thisNode, '.layout' ) : null;
		const layoutPrimary = layout ? layout.querySelector( '.layout__primary' ) : null;

		if ( layoutPrimary ) {
			layoutPrimary.classList.remove( 'fade-in' );
			void layoutPrimary.offsetWidth; // Force reflow.
			layoutPrimary.classList.add( 'fade-in' );
		}
	}

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
