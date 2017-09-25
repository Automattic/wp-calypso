/**
 * External dependencies
 */
import React from 'react';

import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import config from 'config';

import route from 'lib/route';
import analytics from 'lib/analytics';

function recordEvent( eventAction ) {
	analytics.ga.recordEvent( 'Welcome Box', eventAction );
}

export default localize( React.createClass( {

	displayName: 'NuxWelcomeMessage',

	analyticsEvents: {
		startLink: function() {
			recordEvent( 'Clicked Support Start Link' );
		},
		docsLink: function() {
			recordEvent( 'Clicked Documentation Link' );
		},
		firstPost: function() {
			recordEvent( 'Clicked Start First Post Button' );
		},
		customize: function() {
			recordEvent( 'Clicked Customize Site Button' );
		},
		facebook: function() {
			recordEvent( 'Clicked Connect to Facebook Button' );
		}
	},

	render: function() {
		let welcomeSite = this.props.welcomeSite || false,
			adminURL = welcomeSite.options ? welcomeSite.options.admin_url : route.getSiteFragment( window.location.href ) + '/wp-admin/',
			postLink = '#',
			customizeLink = '#',
			sharingLink = '#',
			customizeEnabled = true;

		if ( welcomeSite ) {
			postLink = '/post/' + welcomeSite.slug;
			customizeLink = config.isEnabled( 'manage/customize' ) ? '/customize/' + welcomeSite.slug : adminURL + 'customize.php?return=' + encodeURIComponent( window.location.href );
			sharingLink = '/sharing/' + welcomeSite.slug;
		}

		if ( window.innerWidth <= 400 ) {
			customizeEnabled = false;
		}

		return (
		    <div className="NuxWelcomeMessage__primary-content">
				<img src="/calypso/images/illustrations/illustration-write.svg" />
				<h3 className="NuxWelcomeMessage__title">{ this.props.translate( 'Welcome to WordPress.com!' ) }</h3>
				<p className="NuxWelcomeMessage__intro">
					{ this.props.translate(
						'This is your site dashboard where you can write posts and control your site. ' +
						'Since you\'re new, check out our {{startLink}}setup guides{{/startLink}}. ' +
						'Our {{docsLink}}support documentation{{/docsLink}} is available 24/7.', {
							components: {
								startLink: <a
									href="https://en.support.wordpress.com/start/"
									target="_blank"
									rel="noopener noreferrer"
									onClick={ this.analyticsEvents.startLink }
								/>,
								docsLink: <a
									href="http://en.support.wordpress.com/"
									target="_blank"
									rel="noopener noreferrer"
									onClick={ this.analyticsEvents.docsLink }
								/>
							}
						} ) }
				</p>
				<p>
					{ customizeEnabled
					? <a href={ customizeLink } className="button is-primary" onClick={ this.analyticsEvents.customize }>{
						this.props.translate( 'Customize your Site' )
					}</a>
					: null }
					<a href={ postLink } className="button" onClick={ this.analyticsEvents.firstPost }>{
						this.props.translate( 'Start your first Post' )
					}</a>
					<a href={ sharingLink } className="button" onClick={ this.analyticsEvents.facebook }>{
						this.props.translate( 'Connect to Facebook' )
					}</a>
				</p>
			</div>
		);
	}
} ) );
