import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import UpsellNudge from 'calypso/blocks/upsell-nudge';
import { getCurrentPlan } from 'calypso/state/sites/plans/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

import './style.scss';

class UpworkBanner extends PureComponent {
	static propTypes = {
		currentPlan: PropTypes.object,
		location: PropTypes.string.isRequired,
		siteId: PropTypes.number,
		translate: PropTypes.func.isRequired,
	};

	render() {
		const { translate, location, currentPlan } = this.props;
		const plan = currentPlan?.productSlug;

		return (
			<UpsellNudge
				event={ 'calypso_upwork_banner_start_now_button_click' }
				forceDisplay //Upwork banner has its own logic for showing/hiding
				className="upwork-banner__troubleshooting"
				showIcon
				onClick={ () => window.open( 'https://wordpress.com/built-by-wordpress-com/', '_blank' ) }
				callToAction={ translate( 'Find your expert' ) }
				dismissPreferenceName={ 'upwork-dismissible-banner' }
				tracksClickName={ 'calypso_upwork_banner_start_now_button_click' }
				tracksClickProperties={ { location, plan } }
				tracksImpressionName={ 'calypso_upwork_banner_view' }
				tracksDismissName={ 'calypso_upwork_banner_dismiss_icon_click' }
				tracksDismissProperties={ { location: location, plan } }
				href="#"
				title={ translate( 'Let our WordPress.com experts build your site!' ) }
				description={ translate(
					'You want the website of your dreams. Our experts can create it for you.'
				) }
			/>
		);
	}
}

const mapStateToProps = ( state ) => {
	const siteId = getSelectedSiteId( state );
	const currentPlan = getCurrentPlan( state, siteId );

	return {
		currentPlan,
		siteId,
	};
};

export default connect( mapStateToProps, null )( localize( UpworkBanner ) );
