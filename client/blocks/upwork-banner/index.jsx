/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';

/**
 * Internal dependencies
 */
import { dismissBanner } from './actions';
import { getCurrentPlan } from 'calypso/state/sites/plans/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import isUpworkBannerDismissed from 'calypso/state/selectors/is-upwork-banner-dismissed';
import QueryPreferences from 'calypso/components/data/query-preferences';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import UpsellNudge from 'calypso/blocks/upsell-nudge';

/**
 * Style dependencies
 */
import './style.scss';

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
			<>
				<QueryPreferences />
				<UpsellNudge
					forceDisplay //Upwork banner has its own logic for showing/hiding
					className="upwork-banner"
					callToAction={ translate( 'Find your expert' ) }
					onClick={ this.onStartNowClick }
					href="https://wordpress.com/built-by-wordpress-com/"
					title={ translate( 'Let our WordPress.com experts build your site!' ) }
					description={ translate(
						'You want the website of your dreams. Our experts can create it for you.'
					) }
					dismissPreferenceName={ this.props.location }
					onDismissClick={ this.onDismissClick }
				/>
			</>
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
