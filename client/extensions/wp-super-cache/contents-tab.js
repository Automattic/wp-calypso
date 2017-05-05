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
import { generateStats } from './state/stats/actions';
import {
	getStats,
	isGeneratingStats,
} from './state/stats/selectors';

class ContentsTab extends Component {
	static propTypes = {
		fields: PropTypes.object,
		handleDeleteCache: PropTypes.func.isRequired,
		isDeleting: PropTypes.bool,
		isMultisite: PropTypes.bool,
		translate: PropTypes.func.isRequired,
	};

	static defaultProps = {
		fields: {},
		isDeleting: false,
		isMultisite: false,
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

	generateStats = () => this.props.generateStats( this.props.siteId );

	render() {
		const {
			fields: {
				cache_max_time,
			},
			isDeleting,
			isGenerating,
			isMultisite,
			stats: {
				generated,
				supercache,
				wpcache,
			},
			translate,
		} = this.props;

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
									args: { generated: generated || 0 },
								}
							) }
						</p>
					}
						<Button
							compact
							disabled={ isGenerating }
							onClick={ this.generateStats }>
							{ translate( 'Regenerate Cache Stats' ) }
						</Button>
					</div>
				</Card>

				<div>
				{ ! isEmpty( get( wpcache, 'cached_list' ) ) &&
					<CacheStats header="Fresh WP-Cached Files" files={ wpcache.cached_list } />
				}

				{ ! isEmpty( get( wpcache, 'expired_list' ) ) &&
					<CacheStats header="Stale WP-Cached Files" files={ wpcache.expired_list } />
				}

				{ ! isEmpty( get( supercache, 'cached_list' ) ) &&
					<CacheStats header="Fresh Super Cached Files" files={ supercache.cached_list } />
				}

				{ ! isEmpty( get( supercache, 'expired_list' ) ) &&
					<CacheStats header="Stale Super Cached Files" files={ supercache.expired_list } />
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
		const isGenerating = isGeneratingStats( state, siteId ) && ! stats;

		return {
			isGenerating,
			stats,
		};
	},
	{ generateStats },
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
