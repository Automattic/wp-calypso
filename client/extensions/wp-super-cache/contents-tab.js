/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { flowRight, get, isEmpty, pick } from 'lodash';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import CacheStats from './cache-stats';
import Card from 'components/card';
import SectionHeader from 'components/section-header';
import WrapSettingsForm from './wrap-settings-form';
import { getSelectedSiteId } from 'state/ui/selectors';
import {
	errorNotice,
	removeNotice,
	successNotice,
} from 'state/notices/actions';
import { generateStats } from './state/stats/actions';
import {
	getSiteTitle,
	isJetpackSiteMultiSite,
} from 'state/sites/selectors';
import {
	getStats,
	isGeneratingStats,
	isStatsGenerationSuccessful,
} from './state/stats/selectors';

class ContentsTab extends Component {
	static propTypes = {
		fields: PropTypes.object,
		handleDeleteCache: PropTypes.func.isRequired,
		isDeleting: PropTypes.bool,
		isMultisite: PropTypes.bool,
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
	}

	componentWillReceiveProps( nextProps ) {
		if ( this.props.isDeleting && ! nextProps.isDeleting ) {
			this.setState( {
				isDeleting: false,
				isDeletingAll: false,
				isDeletingExpired: false,
			} );
		}
	}

	componentDidUpdate( prevProps ) {
		if ( this.props.isGenerating || ! prevProps.isGenerating ) {
			return;
		}

		const {
			isSuccessful,
			siteTitle,
			translate,
		} = this.props;

		if ( isSuccessful ) {
			this.props.successNotice(
				translate( 'Cache stats regenerated on %(site)s.', { args: { site: siteTitle } } ),
				{ id: 'wpsc-cache-stats' }
			);
		} else {
			this.props.errorNotice(
				translate( 'There was a problem regenerating the stats. Please try again.' ),
				{ id: 'wpsc-cache-stats' }
			);
		}
	}

	deleteCache = () => {
		this.setState( { isDeleting: true } );
		this.props.handleDeleteCache( false, false );
	}

	deleteExpiredCache = () => {
		this.setState( { isDeletingExpired: true } );
		this.props.handleDeleteCache( false, true );
	}

	deleteAllCaches = () => {
		this.setState( { isDeletingAll: true } );
		this.props.handleDeleteCache( true, false );
	}

	generateStats = () => {
		this.props.removeNotice( 'wpsc-cache-stats' );
		this.props.generateStats( this.props.siteId );
	}

	render() {
		const {
			fields: {
				cache_max_time,
			},
			isDeleting,
			isGenerating,
			isMultisite,
			stats,
			translate,
		} = this.props;
		const supercache = ( get( stats, 'supercache', {} ) );
		const wpcache = ( get( stats, 'wpcache', {} ) );

		return (
			<div>
				<SectionHeader label={ translate( 'Cache Contents' ) } />
				<Card compact>
					<div>
					{ wpcache &&
						<div className="wp-super-cache__cache-stat">
							<span className="wp-super-cache__cache-stat-label">
								{ translate(
									'WP-Cache (%(size)s)',
									{
										args: { size: wpcache && wpcache.fsize || '0KB' },
									}
								) }
							</span>
							<span className="wp-super-cache__cache-stat-item">
								{ `${ wpcache && wpcache.cached || 0 } Cached Pages` }
							</span>
							<span className="wp-super-cache__cache-stat-item">
								{ `${ wpcache && wpcache.expired || 0 } Expired Pages` }
							</span>
						</div>
					}

					{ supercache &&
						<div className="wp-super-cache__cache-stat">
							<span className="wp-super-cache__cache-stat-label">
								{ translate(
									'WP-Super-Cache (%(size)s)',
									{
										args: { size: supercache && supercache.fsize || '0KB' },
									}
								) }
							</span>
							<span className="wp-super-cache__cache-stat-item">
								{ `${ supercache && supercache.cached || 0 } Cached Pages` }
							</span>
							<span className="wp-super-cache__cache-stat-item">
								{ `${ supercache && supercache.expired || 0 } Expired Pages` }
							</span>
						</div>
					}

					{ ( wpcache || supercache ) &&
						<p className="wp-super-cache__cache-stat-refresh">
							{ translate(
								'Cache stats last generated: %(generated)d minutes ago.',
								{
									args: { generated: ( get( stats, 'generated', 0 ) ) },
								}
							) }
						</p>
					}
						<Button
							compact
							busy={ isGenerating }
							disabled={ isGenerating }
							onClick={ this.generateStats }>
							{ translate( 'Regenerate Cache Stats' ) }
						</Button>
					</div>
				</Card>

				<div>
				{ ! isEmpty( get( wpcache, 'cached_list' ) ) &&
					<CacheStats
						files={ wpcache.cached_list }
						header={ translate( 'Fresh WP-Cached Files' ) }
						isCached={ true }
						isSupercache={ false } />
				}

				{ ! isEmpty( get( wpcache, 'expired_list' ) ) &&
					<CacheStats
						files={ wpcache.expired_list }
						header={ translate( 'Stale WP-Cached Files' ) }
						isCached={ false }
						isSupercache={ false } />
				}

				{ ! isEmpty( get( supercache, 'cached_list' ) ) &&
					<CacheStats
						files={ supercache.cached_list }
						header={ translate( 'Fresh Super Cached Files' ) }
						isCached={ true }
						isSupercache={ true } />
				}

				{ ! isEmpty( get( supercache, 'expired_list' ) ) &&
					<CacheStats
						files={ supercache.expired_list }
						header={ translate( 'Stale Super Cached Files' ) }
						isCached={ false }
						isSupercache={ true } />
				}
				</div>

				<Card>
					{ cache_max_time &&
						<p>
							{ translate(
								'Expired files are files older than %(cache_max_time)d seconds. They are still used by ' +
								'the plugin and are deleted periodically.',
								{
									args: { cache_max_time: cache_max_time || 0 }
								}
							) }
						</p>
					}
					<div>
						<Button
							compact
							primary
							busy={ this.state.isDeletingExpired }
							disabled={ isDeleting }
							onClick={ this.deleteExpiredCache }>
							{ translate( 'Delete Expired' ) }
						</Button>
						<Button
							compact
							busy={ this.state.isDeleting }
							disabled={ isDeleting }
							onClick={ this.deleteCache }>
							{ translate( 'Delete Cache' ) }
						</Button>
						{ isMultisite &&
							<Button
								compact
								busy={ this.state.isDeletingAll }
								disabled={ isDeleting }
								onClick={ this.deleteAllCaches }>
								{ translate( 'Delete Cache On All Blogs' ) }
							</Button>
						}
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
		const isSuccessful = isStatsGenerationSuccessful( state, siteId );
		const isMultisite = isJetpackSiteMultiSite( state, siteId );
		const siteTitle = getSiteTitle( state, siteId );

		return {
			isGenerating,
			isMultisite,
			isSuccessful,
			siteTitle,
			stats,
		};
	},
	{
		errorNotice,
		generateStats,
		removeNotice,
		successNotice,
	},
);

const getFormSettings = settings => {
	return pick( settings, [
		'cache_max_time',
	] );
};

export default flowRight(
	connectComponent,
	WrapSettingsForm( getFormSettings )
)( ContentsTab );
