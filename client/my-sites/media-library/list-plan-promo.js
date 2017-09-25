/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import page from 'page';
import analytics from 'lib/analytics';
import { preventWidows } from 'lib/formatting';

/**
 * Internal dependencies
 */
import EmptyContent from 'components/empty-content';

import Button from 'components/button';

export default localize( React.createClass( {
	displayName: 'MediaLibraryListPlanPromo',

	propTypes: {
		site: PropTypes.object,
		filter: PropTypes.string
	},

	getTitle: function() {
		switch ( this.props.filter ) {
			case 'videos':
				return this.props.translate( 'Upload Videos', { textOnly: true, context: 'Media upload plan needed' } );

			case 'audio':
				return this.props.translate( 'Upload Audio', { textOnly: true, context: 'Media upload plan needed' } );

			default:
				return this.props.translate( 'Upload Media', { textOnly: true, context: 'Media upload plan needed' } );
		}
	},

	getSummary: function() {
		switch ( this.props.filter ) {
			case 'videos':
				return preventWidows(
					this.props.translate(
						'To upload video files to your site, upgrade your plan.',
						{ textOnly: true, context: 'Media upgrade promo' }
				), 2 );

			case 'audio':
				return preventWidows(
					this.props.translate(
						'To upload audio files to your site, upgrade your plan.',
						{ textOnly: true, context: 'Media upgrade promo' }
				), 2 );

			default:
				return preventWidows(
					this.props.translate(
						'To upload audio and video files to your site, upgrade your plan.',
						{ textOnly: true, context: 'Media upgrade promo' }
				), 2 );
		}
	},

	viewPlansPage: function() {
		const { slug = '' } = this.props.site;

		analytics.tracks.recordEvent( 'calypso_media_plans_button_click' );

		page( `/plans/${ slug }` );
	},

	render: function() {
		const action = (
			<Button className="button is-primary" onClick={ this.viewPlansPage }>{ this.props.translate( 'See Plans' ) }</Button>
		);

		return (
			<EmptyContent
				title={ this.getTitle() }
				line={ this.getSummary() }
				action={ this.props.children || action }
				illustration={ '' } />
		);
	}
} ) );
