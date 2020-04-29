/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import page from 'page';
import { recordTracksEvent } from 'lib/analytics/tracks';
import { preventWidows } from 'lib/formatting';

/**
 * Internal dependencies
 */
import EmptyContent from 'components/empty-content';
import { Button } from '@automattic/components';
import canCurrentUser from 'state/selectors/can-current-user';
import { getSelectedSiteId } from 'state/ui/selectors';

class MediaLibraryListPlanPromo extends React.Component {
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
		switch ( this.props.filter ) {
			case 'videos':
				return preventWidows(
					this.props.canUpgrade
						? this.props.translate( 'To upload video files to your site, upgrade your plan.', {
								textOnly: true,
								context: 'Media upgrade promo',
						  } )
						: this.props.translate( 'Uploading video requires a paid plan.' ) +
								' ' +
								this.props.translate(
									'Contact your site administrator and ask them to upgrade this site to WordPress.com Premium, Business, or eCommerce.'
								),
					2
				);

			case 'audio':
				return preventWidows(
					this.props.canUpgrade
						? this.props.translate( 'To upload audio files to your site, upgrade your plan.', {
								textOnly: true,
								context: 'Media upgrade promo',
						  } )
						: this.props.translate( 'Uploading audio requires a paid plan.' ) +
								' ' +
								this.props.translate(
									'Contact your site administrator and ask them to upgrade this site to WordPress.com Premium, Business, or eCommerce.'
								),
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
			<Button className="button is-primary" onClick={ this.viewPlansPage }>
				{ this.props.translate( 'See Plans' ) }
			</Button>
		);

		return (
			<EmptyContent
				title={ this.getTitle() }
				line={ this.getSummary() }
				action={ this.props.children || action }
				illustration={ '' }
			/>
		);
	}
}

export default connect( ( state ) => {
	return {
		canUpgrade: canCurrentUser( state, getSelectedSiteId( state ), 'manage_options' ),
	};
} )( localize( MediaLibraryListPlanPromo ) );
