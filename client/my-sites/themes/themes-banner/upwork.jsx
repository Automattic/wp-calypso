/** @format */

/**
 * External dependencies
 */

import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */

import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import Button from 'components/button';
import safeImageUrl from 'lib/safe-image-url';
import { getCurrentPlan } from 'state/sites/plans/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { recordTracksEvent as recordTracksEventAction } from 'state/analytics/actions';
import { isThemesUpworkBannerVisible } from 'state/themes/themes-ui/selectors';
import { hideThemesUpworkBanner } from 'state/themes/themes-ui/actions';

class UpworkBanner extends PureComponent {
	static propTypes = {
		// Connected props
		siteId: PropTypes.number,
		currentPlan: PropTypes.object,
		isBannerVisible: PropTypes.bool,
		hideThemesBanner: PropTypes.func.isRequired,
	};

	componentDidMount() {
		this.recordView();
	}

	componentDidUpdate( prevProps ) {
		if ( prevProps.siteId && this.props.siteId && this.props.siteId !== prevProps.siteId ) {
			this.recordView();
		}
	}

	recordView() {
		if ( this.props.isBannerVisible ) {
			this.props.recordTracksEvent( 'calypso_upwork_themes_banner_view' );
		}
	}

	recordClick = eventName => {
		const plan = this.props.currentPlan ? this.props.currentPlan.productSlug : '';

		this.props.recordTracksEvent( eventName, { plan } );
	};

	onDismissClick = e => {
		this.recordClick( 'calypso_upwork_themes_banner_dismiss_icon_click' );
		e.preventDefault();
		this.props.hideThemesBanner();
	};

	onStartNowClick = () => {
		this.recordClick( 'calypso_upwork_themes_banner_start_now_button_click' );
	};

	render() {
		const { isBannerVisible, translate } = this.props;
		if ( ! isBannerVisible ) {
			return null; // Do not show banner if the user has closed it.
		}
		return (
			<a
				className="themes-banner__upwork"
				role="button"
				style={ { backgroundColor: '#DAF5FC' } }
				onClick={ this.onStartNowClick }
				href={ '/experts/upwork?source=theme-banner' }
				target="_blank"
				rel="noopener noreferrer"
			>
				<h1 className="themes-banner__title">
					{ translate( 'Need an expert to help realize your vision? Hire one!' ) }
				</h1>
				<p className="themes-banner__description">
					{ translate(
						"We've partnered with Upwork, a network of freelancers with a huge pool of WordPress experts. They know their stuff and they're waiting to help you build your dream site."
					) }
				</p>
				<Button className="themes-banner__cta" compact primary>
					{ translate( 'Find your expert' ) }
				</Button>
				<Button className="themes-banner__close" onClick={ this.onDismissClick }>
					<Gridicon icon="cross-small" size={ 18 } />
				</Button>
				<img
					alt={ translate( 'Upwork' ) }
					width={ 390 }
					className="themes-banner__image"
					src={ safeImageUrl( '/calypso/images/themes-banner/illustration-builder-referral.svg' ) }
				/>
			</a>
		);
	}
}

const mapStateToProps = state => {
	const siteId = getSelectedSiteId( state );
	const isBannerVisible = isThemesUpworkBannerVisible( state );
	const currentPlan = getCurrentPlan( state, siteId );
	return {
		currentPlan,
		siteId,
		isBannerVisible,
	};
};

export default connect(
	mapStateToProps,
	{
		recordTracksEvent: recordTracksEventAction,
		hideThemesBanner: hideThemesUpworkBanner,
	}
)( localize( UpworkBanner ) );
