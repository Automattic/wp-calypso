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
		const plan = this.props.plan ? this.props.plan.productSlug : '';

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
				style={ { backgroundColor: '#DBF5FB' } }
				onClick={ this.onStartNowClick }
				href={ '/experts/upwork?source=stat-banner' }
				target="_blank"
				rel="noopener noreferrer"
			>
				<h1 className="themes-banner__title">
					{ translate( 'Hire a WordPress.com Expert to Build Your Website' ) }
				</h1>
				<p className="themes-banner__description">
					{ translate(
						"WordPres has partnered with Upwork - tap into an unlimited resource of talented professionals to help build the site you've always wanted."
					) }
				</p>
				<Button className="themes-banner__cta" compact primary>
					{ translate( 'Hire a WordPress.com Expert' ) }
				</Button>
				<Button className="themes-banner__close" onClick={ this.onDismissClick }>
					<Gridicon icon="cross-small" size={ 18 } />
				</Button>
				<img
					alt={ translate( 'Upwork' ) }
					width={ 390 }
					className="themes-banner__image"
					src={ safeImageUrl( '/calypso/images/themes-banner/illustration-builder-referral.svg' ) }
					style={ { transform: 'translateY(-4.4%) translateX(17%)' } }
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
