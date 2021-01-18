/**
 * External dependencies
 */
import { connect } from 'react-redux';
import Gridicon from 'calypso/components/gridicon';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import { dismissBanner } from './actions';
import { getCurrentPlan } from 'calypso/state/sites/plans/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import isUpworkBannerDismissed from 'calypso/state/selectors/is-upwork-banner-dismissed';
import QueryPreferences from 'calypso/components/data/query-preferences';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

/**
 * Style dependencies
 */
import './style.scss';

/**
 * Image dependencies
 */
import builderIllustration from 'calypso/assets/images/illustrations/builder-referral.svg';

class UpworkBanner extends PureComponent {
	static propTypes = {
		currentPlan: PropTypes.object,
		dismissBanner: PropTypes.func.isRequired,
		isBannerVisible: PropTypes.bool.isRequired,
		location: PropTypes.string.isRequired,
		recordTracksEvent: PropTypes.func.isRequired,
		siteId: PropTypes.number,
		translate: PropTypes.func.isRequired,
	};

	componentDidMount() {
		this.recordView();
	}

	componentDidUpdate( prevProps ) {
		if ( prevProps.siteId && this.props.siteId && this.props.siteId !== prevProps.siteId ) {
			this.recordView();
		}
	}

	onDismissClick = ( event ) => {
		event.preventDefault();
		event.stopPropagation();
		this.recordEvent( 'calypso_upwork_banner_dismiss_icon_click' );
		this.props.dismissBanner( this.props.location );
	};

	onStartNowClick = () => {
		this.recordEvent( 'calypso_upwork_banner_start_now_button_click' );
	};

	recordEvent = ( eventName ) => {
		const { currentPlan, location } = this.props;
		const plan = currentPlan ? currentPlan.productSlug : '';
		this.props.recordTracksEvent( eventName, { location, ...( plan && { plan } ) } );
	};

	recordView() {
		if ( this.props.isBannerVisible ) {
			this.recordEvent( 'calypso_upwork_banner_view' );
		}
	}

	render() {
		const { isBannerVisible, translate } = this.props;
		if ( ! isBannerVisible ) {
			return null;
		}
		return (
			<a
				className="upwork-banner"
				role="button"
				style={ { backgroundColor: '#DAF5FC' } }
				onClick={ this.onStartNowClick }
				href={ 'https://wordpress.com/built-by-wordpress-com/' }
			>
				<QueryPreferences />
				<h1 className="upwork-banner__title">
					{ translate( 'Let Our WordPress.com Experts Build Your Site!' ) }
				</h1>
				<p className="upwork-banner__description">
					{ translate( 'You want the website of your dreams. Our experts can create it for you.' ) }
				</p>
				<Button className="upwork-banner__cta" compact primary={ this.props.primaryButton }>
					{ translate( 'Find your expert' ) }
				</Button>
				<Button className="upwork-banner__close" onClick={ this.onDismissClick }>
					<Gridicon icon="cross-small" size={ 18 } />
				</Button>
				<img
					alt={ translate( 'Find your expert' ) }
					width={ 390 }
					className="upwork-banner__image"
					src={ builderIllustration }
				/>
			</a>
		);
	}
}

const mapStateToProps = ( state, ownProps ) => {
	const siteId = getSelectedSiteId( state );
	const currentPlan = getCurrentPlan( state, siteId );
	const isBannerVisible = ! isUpworkBannerDismissed( state, ownProps.location );

	return {
		currentPlan,
		isBannerVisible,
		siteId,
	};
};

export default connect( mapStateToProps, {
	dismissBanner,
	recordTracksEvent,
} )( localize( UpworkBanner ) );
