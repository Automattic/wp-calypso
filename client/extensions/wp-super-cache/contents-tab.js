/**
 * External dependencies
 */
import React, { Component } from 'react';
import { pick } from 'lodash';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import CachedFiles from './cached-files';
import Card from 'components/card';
import SectionHeader from 'components/section-header';
import WrapSettingsForm from './wrap-settings-form';

class ContentsTab extends Component {
	state = {
		isDeleting: false,
		isDeletingAll: false,
	}

	componentWillReceiveProps( nextProps ) {
		if ( this.props.isDeleting && ! nextProps.isDeleting ) {
			this.setState( {
				isDeleting: false,
				isDeletingAll: false,
			} );
		}
	}

	deleteCache = () => {
		this.setState( { isDeleting: true } );
		this.props.handleDeleteCache( false );
	}

	deleteAllCaches = () => {
		this.setState( { isDeletingAll: true } );
		this.props.handleDeleteCache( true );
	}

	render() {
		const {
			fields: {
				cache_max_time,
				generated,
				supercache,
				wpcache,
			},
			isDeleting,
			isMultisite,
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
						<Button compact>
							{ translate( 'Regenerate Cache Stats' ) }
						</Button>
					</div>
				</Card>

				<div>
				{ wpcache && wpcache.cached_list &&
					<CachedFiles header="Fresh WP-Cached Files" files={ wpcache.cached_list } />
				}

				{ wpcache && wpcache.expired_list &&
					<CachedFiles header="Stale WP-Cached Files" files={ wpcache.expired_list } />
				}

				{ supercache && supercache.cached_list &&
					<CachedFiles header="Fresh Super Cached Files" files={ supercache.cached_list } />
				}

				{ supercache && supercache.expired_list &&
					<CachedFiles header="Stale Super Cached Files" files={ supercache.expired_list } />
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
						<Button compact primary>
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

const getFormSettings = settings => {
	const cacheStats = pick( settings.cache_stats, [
		'generated',
		'supercache',
		'wpcache',
	] );
	const otherSettings = pick( settings, [
		'cache_max_time',
	] );

	return { ...cacheStats, ...otherSettings };
};

export default WrapSettingsForm( getFormSettings )( ContentsTab );
