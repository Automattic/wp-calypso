import {
	PLAN_BUSINESS,
	PLAN_ECOMMERCE,
	PLAN_PERSONAL,
	PLAN_PREMIUM,
	getPlan,
} from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { Button } from '@automattic/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import EmptyContent from 'calypso/components/empty-content';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { preventWidows } from 'calypso/lib/formatting';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

class MediaLibraryListPlanPromo extends Component {
	static displayName = 'MediaLibraryListPlanPromo';

	static propTypes = {
		site: PropTypes.object,
		filter: PropTypes.string,
	};

	getTitle = () => {
		switch ( this.props.filter ) {
			case 'videos':
				return this.props.translate( 'Upload Videos', {
					textOnly: true,
					context: 'Media upload plan needed',
				} );

			case 'audio':
				return this.props.translate( 'Upload Audio', {
					textOnly: true,
					context: 'Media upload plan needed',
				} );

			default:
				return this.props.translate( 'Upload Media', {
					textOnly: true,
					context: 'Media upload plan needed',
				} );
		}
	};

	getSummary = () => {
		const contactAdminText = this.props.translate(
			'Contact your site administrator and ask them to upgrade this site to WordPress.com %(premiumPlanName)s, %(businessPlanName)s, or %(commercePlanName)s.',
			{
				args: {
					premiumPlanName: getPlan( PLAN_PREMIUM )?.getTitle(),
					businessPlanName: getPlan( PLAN_BUSINESS )?.getTitle(),
					commercePlanName: getPlan( PLAN_ECOMMERCE )?.getTitle(),
				},
			}
		);
		switch ( this.props.filter ) {
			case 'videos':
				return preventWidows(
					this.props.canUpgrade
						? /* translators: %(planName)s is the short-hand version of the Premium plan name */
						  this.props.translate( 'Upgrade to the %(planName)s plan to enable VideoPress', {
								args: { planName: getPlan( PLAN_PREMIUM )?.getTitle() ?? '' },
						  } )
						: this.props.translate( 'Uploading video requires a paid plan.' ) +
								' ' +
								contactAdminText,
					2
				);

			case 'audio':
				return preventWidows(
					this.props.canUpgrade
						? /* translators: %(planName)s is the short-hand version of the Personal plan name */
						  this.props.translate( 'Upgrade to the %(planName)s plan to enable audio uploads', {
								args: { planName: getPlan( PLAN_PERSONAL )?.getTitle() ?? '' },
						  } )
						: this.props.translate( 'Uploading audio requires a paid plan.' ) +
								' ' +
								contactAdminText,
					2
				);

			default:
				return preventWidows(
					this.props.translate(
						'To upload audio and video files to your site, upgrade your plan.',
						{
							textOnly: true,
							context: 'Media upgrade promo',
						}
					),
					2
				);
		}
	};

	viewPlansPage = () => {
		const { slug = '' } = this.props.site;

		recordTracksEvent( 'calypso_media_plans_button_click' );

		page( `/plans/${ slug }` );
	};

	render() {
		const action = (
			<Button className="list-plan-promo__button button is-primary" onClick={ this.viewPlansPage }>
				{ this.props.translate( 'See Plans' ) }
			</Button>
		);

		return (
			<EmptyContent
				title={ this.getTitle() }
				line={ this.getSummary() }
				action={ this.props.children || action }
				illustration=""
			/>
		);
	}
}

export default connect( ( state ) => {
	return {
		canUpgrade: canCurrentUser( state, getSelectedSiteId( state ), 'manage_options' ),
	};
} )( localize( MediaLibraryListPlanPromo ) );
