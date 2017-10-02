/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { localize } from 'i18n-calypso';
import Immutable from 'immutable';
import { includes, zip } from 'lodash';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import SiteInfo from 'blocks/site';

class BlogSettingsHeader extends PureComponent {
	static propTypes = {
		site: PropTypes.object.isRequired,
		settings: PropTypes.instanceOf( Immutable.Map ).isRequired,
		disableToggle: PropTypes.bool,
		onToggle: PropTypes.func.isRequired
	};

	state = { isExpanded: false };

	toggleExpanded = () => {
		if ( this.props.disableToggle ) {
			return;
		}

		const isExpanded = ! this.state.isExpanded;
		this.setState( { isExpanded } );

		analytics.ga.recordEvent( 'Notification Settings', isExpanded ? 'Expanded Site' : 'Collapsed Site', this.props.site.name );

		this.props.onToggle();
	};

	getLegend = () => {
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
			return this.props.translate( 'no notifications' );
		}

		if ( size === count ) {
			return this.props.translate( 'all notifications' );
		}

		return this.props.translate( 'some notifications' );
	};

	render() {
		const { site } = this.props;

		return (
			<header key={ site.wpcom_url } className="blogs-settings__header" onClick={ this.toggleExpanded }>
				<SiteInfo site={ site } indicator={ false } />
				<div className="blogs-settings__header-legend">
					<em>{ this.getLegend() }</em>
				</div>
				{ ! this.props.disableToggle
					? (
							<div className="blogs-settings__header-expand">
								<a className={ 'noticon noticon-' + ( this.state.isExpanded ? 'collapse' : 'expand' ) }></a>
							</div>
						)
					: null }
			</header>
		);
	}
}

export default localize( BlogSettingsHeader );
