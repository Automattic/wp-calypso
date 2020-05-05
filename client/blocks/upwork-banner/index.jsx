/**
 * External dependencies
 */
import { connect } from 'react-redux';
import Gridicon from 'components/gridicon';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import { dismissBanner } from './actions';
import { getCurrentPlan } from 'state/sites/plans/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import isUpworkBannerDismissed from 'state/selectors/is-upwork-banner-dismissed';
import QueryPreferences from 'components/data/query-preferences';
import { recordTracksEvent } from 'state/analytics/actions';
import safeImageUrl from 'lib/safe-image-url';

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
		const { isBannerVisible, location, translate } = this.props;
		if ( ! isBannerVisible ) {
			return null;
		}
		return (
			<a
				className="upwork-banner"
				role="button"
				style={ { backgroundColor: '#DAF5FC' } }
				onClick={ this.onStartNowClick }
				href={ `/experts/upwork?source=${ location }` }
				target="_blank"
				rel="noopener noreferrer"
			>
				<QueryPreferences />
				<h1 className="upwork-banner__title">
					{ translate( 'Need an expert to help realize your vision? Hire one!' ) }
				</h1>
				<p className="upwork-banner__description">
					{ translate(
						"We've partnered with Upwork, a network of freelancers with a huge pool of WordPress experts. They know their stuff and they're waiting to help you build your dream site."
					) }
				</p>
				<Button className="upwork-banner__cta" compact primary={ this.props.primaryButton }>
					{ translate( 'Find your expert' ) }
				</Button>
				<Button className="upwork-banner__close" onClick={ this.onDismissClick }>
					<Gridicon icon="cross-small" size={ 18 } />
				</Button>
				<img
					alt={ translate( 'Upwork' ) }
					width={ 390 }
					className="upwork-banner__image"
					src={ safeImageUrl( '/calypso/images/themes-banner/illustration-builder-referral.svg' ) }
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
