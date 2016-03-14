/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import PureRenderMixin from 'react-pure-render/mixin';
import Immutable from 'immutable';
import zip from 'lodash/zip';
import includes from 'lodash/includes';

/**
 * Internal dependencies
 */
import SiteInfo from 'my-sites/site';

export default React.createClass( {
	displayName: 'BlogSettingsHeader',

	mixins: [ PureRenderMixin ],

	propTypes: {
		blog: PropTypes.object.isRequired,
		settings: PropTypes.instanceOf( Immutable.Map ).isRequired
	},

	getLegend() {
		const tally = o => o.reduce( ( total, value ) => total + value );
		const sizeAndSum = settings => [ settings.size, tally( settings ) ];

		let counts = this.props.settings
			.deleteIn( [ 'email', 'achievement' ] )
			.filterNot( ( _, key ) => includes( [ 'blog_id', 'devices' ], key ) )
			.map( sizeAndSum )
			.toArray();

		counts = this.props.settings.get( 'devices' )
			.map( device => device.filter( ( _, key ) => key !== 'device_id' ) )
			.map( sizeAndSum )
			.toArray()
			.concat( counts );

		const [ size, count ] = zip.apply( null, counts ).map( tally );

		if ( count === 0 ) {
			return this.translate( 'no notifications' );
		}

		if ( size === count ) {
			return this.translate( 'all notifications' );
		}

		return this.translate( 'some notifications' );
	},

	render() {
		return (
			<div key={ this.props.blog.wpcom_url } className="notification-settings-blog-settings-header">
				<SiteInfo site={ this.props.blog } indicator={ false }/>
				<div className="notification-settings-blog-settings-header__legend">
					<em>{ this.getLegend() }</em>
				</div>
			</div>
		);
	}
} );
