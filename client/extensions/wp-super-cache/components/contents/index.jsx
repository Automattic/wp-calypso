/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { flowRight, get, isEmpty, pick } from 'lodash';

/**
 * Internal dependencies
 */
import { Button, Card } from '@automattic/components';
import CacheStats from './cache-stats';
import QueryStats from '../data/query-stats';
import SectionHeader from 'components/section-header';
import WrapSettingsForm from '../wrap-settings-form';
import { getSelectedSiteId } from 'state/ui/selectors';
import { generateStats } from '../../state/stats/actions';
import { getSiteTitle, isJetpackSiteMultiSite } from 'state/sites/selectors';
import { getStats, isGeneratingStats } from '../../state/stats/selectors';

class ContentsTab extends Component {
	static propTypes = {
		fields: PropTypes.object,
		handleDeleteCache: PropTypes.func.isRequired,
		isDeleting: PropTypes.bool,
		isMultisite: PropTypes.bool,
		isReadOnly: PropTypes.bool.isRequired,
		site: PropTypes.object.isRequired,
		siteTitle: PropTypes.string,
		translate: PropTypes.func.isRequired,
	};

	static defaultProps = {
		fields: {},
		isDeleting: false,
		isMultisite: false,
		siteTitle: '',
	};

	state = {
		isDeleting: false,
		isDeletingAll: false,
		isDeletingExpired: false,
	};

	UNSAFE_componentWillReceiveProps( nextProps ) {
		if ( this.props.isDeleting && ! nextProps.isDeleting ) {
			this.setState( {
				isDeleting: false,
				isDeletingAll: false,
				isDeletingExpired: false,
			} );
		}
	}

	deleteCache = () => {
		this.setState( { isDeleting: true } );
		this.props.handleDeleteCache( false, false );
	};

	deleteExpiredCache = () => {
		this.setState( { isDeletingExpired: true } );
		this.props.handleDeleteCache( false, true );
	};

	deleteAllCaches = () => {
		this.setState( { isDeletingAll: true } );
		this.props.handleDeleteCache( true, false );
	};

	generateStats = () => this.props.generateStats( this.props.siteId );

	render() {
		const {
			fields: { cache_max_time },
			isDeleting,
			isGenerating,
			isMultisite,
			isReadOnly,
			siteId,
			stats,
			translate,
		} = this.props;
		const isDisabled = isDeleting || isReadOnly;
		const supercache = get( stats, 'supercache', {} );
		const wpcache = get( stats, 'wpcache', {} );

		return (
			<div>
				<QueryStats siteId={ siteId } />
				<SectionHeader label={ translate( 'Cache Contents' ) } />
				<Card compact>
					<div>
						{ wpcache && (
							<div className="wp-super-cache__cache-stat">
								<span className="wp-super-cache__cache-stat-label">
									{ translate( 'WP-Cache (%(size)s)', {
										args: { size: ( wpcache && wpcache.fsize ) || '0KB' },
									} ) }
								</span>
								<span className="wp-super-cache__cache-stat-item">
									{ `${ ( wpcache && wpcache.cached ) || 0 } Cached Pages` }
								</span>
								<span className="wp-super-cache__cache-stat-item">
									{ `${ ( wpcache && wpcache.expired ) || 0 } Expired Pages` }
								</span>
							</div>
						) }

						{ supercache && (
							<div className="wp-super-cache__cache-stat">
								<span className="wp-super-cache__cache-stat-label">
									{ translate( 'WP-Super-Cache (%(size)s)', {
										args: { size: ( supercache && supercache.fsize ) || '0KB' },
									} ) }
								</span>
								<span className="wp-super-cache__cache-stat-item">
									{ `${ ( supercache && supercache.cached ) || 0 } Cached Pages` }
								</span>
								<span className="wp-super-cache__cache-stat-item">
									{ `${ ( supercache && supercache.expired ) || 0 } Expired Pages` }
								</span>
							</div>
						) }

						<Button
							compact
							busy={ isGenerating }
							disabled={ isGenerating }
							onClick={ this.generateStats }
						>
							{ translate( 'Regenerate Cache Stats' ) }
						</Button>
					</div>
				</Card>

				<div>
					{ ! isEmpty( get( wpcache, 'cached_list' ) ) && (
						<CacheStats
							files={ wpcache.cached_list }
							header={ translate( 'Fresh Full Cache Files' ) }
							isCached={ true }
							isSupercache={ false }
						/>
					) }

					{ ! isEmpty( get( wpcache, 'expired_list' ) ) && (
						<CacheStats
							files={ wpcache.expired_list }
							header={ translate( 'Stale Full Cache Files' ) }
							isCached={ false }
							isSupercache={ false }
						/>
					) }

					{ ! isEmpty( get( supercache, 'cached_list' ) ) && (
						<CacheStats
							files={ supercache.cached_list }
							header={ translate( 'Fresh Super Cached Files' ) }
							isCached={ true }
							isSupercache={ true }
						/>
					) }

					{ ! isEmpty( get( supercache, 'expired_list' ) ) && (
						<CacheStats
							files={ supercache.expired_list }
							header={ translate( 'Stale Super Cached Files' ) }
							isCached={ false }
							isSupercache={ true }
						/>
					) }
				</div>

				<Card>
					{ cache_max_time > 0 && (
						<p>
							{ translate(
								'Expired files are files older than %(cache_max_time)d seconds. They are still used by ' +
									'the plugin and are deleted periodically.',
								{
									args: { cache_max_time: cache_max_time || 0 },
								}
							) }
						</p>
					) }
					<div>
						<Button
							compact
							primary
							busy={ this.state.isDeletingExpired }
							disabled={ isDisabled }
							onClick={ this.deleteExpiredCache }
						>
							{ translate( 'Delete Expired' ) }
						</Button>
						<Button
							compact
							busy={ this.state.isDeleting }
							disabled={ isDisabled }
							onClick={ this.deleteCache }
						>
							{ translate( 'Delete Cache' ) }
						</Button>
						{ isMultisite && (
							<Button
								compact
								busy={ this.state.isDeletingAll }
								disabled={ isDisabled }
								onClick={ this.deleteAllCaches }
							>
								{ translate( 'Delete Cache On All Blogs' ) }
							</Button>
						) }
					</div>
				</Card>
			</div>
		);
	}
}

const connectComponent = connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const stats = getStats( state, siteId );
		const isGenerating = isGeneratingStats( state, siteId );
		const isMultisite = isJetpackSiteMultiSite( state, siteId );
		const siteTitle = getSiteTitle( state, siteId );

		return {
			isGenerating,
			isMultisite,
			siteTitle,
			stats,
		};
	},
	{ generateStats }
);

const getFormSettings = ( settings ) => {
	return pick( settings, [ 'cache_max_time' ] );
};

export default flowRight( connectComponent, WrapSettingsForm( getFormSettings ) )( ContentsTab );
