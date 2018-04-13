/** @format */

/**
 * External dependencies
 */

import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ConnectedAppItem from 'me/connected-application-item';
import DocumentHead from 'components/data/document-head';
import EmptyContent from 'components/empty-content';
import Main from 'components/main';
import MeSidebarNavigation from 'me/sidebar-navigation';
import notices from 'notices';
/* eslint-disable no-restricted-imports */
// FIXME: Remove use of this mixin
import observe from 'lib/mixins/data-observe';
/* eslint-enable no-restricted-imports */
import ReauthRequired from 'me/reauth-required';
import SecuritySectionNav from 'me/security-section-nav';
import twoStepAuthorization from 'lib/two-step-authorization';
import { successNotice } from 'state/notices/actions';
import PageViewTracker from 'lib/analytics/page-view-tracker';

/* eslint-disable react/prefer-es6-class */
// FIXME: Remove use of createReactClass
const ConnectedApplications = createReactClass( {
	/* eslint-enable react/prefer-es6-class */
	displayName: 'ConnectedApplications',

	propTypes: {
		translate: PropTypes.func.isRequired,
	},

	mixins: [ observe( 'connectedAppsData' ) ],

	getDefaultProps: function() {
		return {
			applicationID: 0,
		};
	},

	revokeConnection: function( applicationID, callback ) {
		const application = this.props.connectedAppsData.getApplication( applicationID );
		if ( 'undefined' !== typeof application ) {
			this.props.connectedAppsData.revoke(
				parseInt( applicationID, 10 ),
				function( error ) {
					if ( error ) {
						notices.clearNotices( 'notices' );
						callback( error );
					} else {
						this.props.successNotice(
							this.props.translate(
								'%(applicationTitle)s no longer has access to your WordPress.com account.',
								{
									args: {
										applicationTitle: application.title,
									},
								}
							)
						);
					}
				}.bind( this )
			);
		}
	},

	renderEmptyContent: function() {
		const { translate } = this.props;
		return (
			<EmptyContent
				title={ translate( "You haven't connected any apps yet." ) }
				line={ translate( 'You can get started with the {{link}}WordPress mobile apps!{{/link}}', {
					components: {
						link: (
							<a
								href="https://apps.wordpress.org/"
								target="_blank"
								rel="noopener noreferrer"
								title="WordPress Mobile Apps"
							/>
						),
					},
				} ) }
			/>
		);
	},

	renderPlaceholders: function() {
		const placeholders = [];

		for ( let i = 0; i < 5; i++ ) {
			placeholders.push(
				<ConnectedAppItem
					connection={ {
						ID: i,
						title: this.props.translate( 'Loading Connected Applications' ),
					} }
					key={ i }
					isPlaceholder
				/>
			);
		}

		return placeholders;
	},

	renderConnectedApps: function() {
		return this.props.connectedAppsData.initialized
			? this.props.connectedAppsData.get().map( function( connection ) {
					return (
						<ConnectedAppItem
							connection={ connection }
							key={ connection.ID }
							connectedApplications={ this.props.connectedAppsData }
							revoke={ this.revokeConnection }
						/>
					);
				}, this )
			: this.renderPlaceholders();
	},

	renderConnectedAppsList: function() {
		let connectedApps;
		const hasConnectedApps = this.props.connectedAppsData.get().length;

		if ( this.props.connectedAppsData.initialized ) {
			connectedApps = hasConnectedApps ? this.renderConnectedApps() : this.renderEmptyContent();
		} else {
			connectedApps = this.renderConnectedApps();
		}

		return (
			<div>
				<SecuritySectionNav path={ this.props.path } />

				{ connectedApps }
			</div>
		);
	},

	render: function() {
		return (
			<Main className="connected-applications">
				<PageViewTracker
					path="/me/security/connected-applications"
					title="Me > Connected Applications"
				/>
				<ReauthRequired twoStepAuthorization={ twoStepAuthorization } />
				<MeSidebarNavigation />

				<DocumentHead title={ this.props.translate( 'Connected Applications' ) } />

				{ this.renderConnectedAppsList() }
			</Main>
		);
	},
} );

export default connect( null, dispatch => bindActionCreators( { successNotice }, dispatch ) )(
	localize( ConnectedApplications )
);
