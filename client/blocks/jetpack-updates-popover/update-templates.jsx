/**
 * External dependencies
 */
import React from 'react';
import config from 'config';

/**
 * Internal dependencies
 */
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';
import Gridicon from 'components/gridicon';

const handleWPCOMUpdate = ( event ) => {
	event.preventDefault();
};

export const renderWPComTemplate = ( { translate, updates } ) => {
	// just for testing purpose
	if ( config.isEnabled( 'gm2016/jetpack-plugin-updates-trashpickup' ) ) {
		updates.wordpress = 1;
		updates.wp_update_version = '5.0.0';
	}

	if ( ! (
		config.isEnabled( 'jetpack_core_inline_update' ) &&
		updates.wordpress &&
		updates.wp_update_version
	) ) {
		return null;
	}

	return (
		<div className="jetpack-updates-popover__block">
			<Gridicon icon="my-sites" size={ 18 } />
			<div className="jetpack-updates-popover__text">
				{ translate( 'A newer version of WordPress is available.' ) }
				<a
					className="jetpack-updates-popover__link"
					href="#"
					onClick={ handleWPCOMUpdate }
				>
					{
						translate( 'Update to %(version)s', {
							args: {
								version: updates.wp_update_version
							}
						} )
					}
					<Gridicon icon="external" size={ 12 } />
				</a>
			</div>
		</div>
	);
};

export const renderPluginsTemplate = (
	{ onClose, site, translate, updates }
	, simpleMode = false
) => {
	if ( ! site.canUpdateFiles || ! updates.plugins ) {
		return null;
	}

	if ( simpleMode ) {
		return (
			<Notice
				isCompact
				status="is-warning"
				icon="plugins"
			>
				{
					translate(
						'There is %(total)d plugin update available.',
						'There are %(total)d plugin updates available.',
						{
							count: updates.plugins,
							args: {
								total: updates.plugins
							}
						}
					)
				}

				<NoticeAction
					className="jetpack-updates-popover__link"
					onClick={ onClose }
					href={ '/plugins/updates/' + site.slug }
				>
					{ translate( 'Update' ) }
				</NoticeAction>
			</Notice>
		);
	}

	return (
		<div className="jetpack-updates-popover__block">
			<Gridicon icon="plugins" size={ 18 } />
			<div className="jetpack-updates-popover__text">
				{
					translate(
						'There is %(total)d plugin update available.',
						'There are %(total)d plugin updates available.',
						{
							count: updates.plugins,
							args: {
								total: updates.plugins
							}
						}
					)
				}
				<a
					className="jetpack-updates-popover__link"
					onClick={ onClose }
					href={ '/plugins/updates/' + site.slug }>
					{ translate( 'View' ) }
					<Gridicon icon="external" size={ 12 } />
				</a>
			</div>
		</div>
	);
};

export const renderThemesTemplate = ( { onClose, updates, site, translate } ) => {
	if ( ! updates.themes ) {
		return null;
	}

	return (
		<div className="jetpack-updates-popover__block">
			<Gridicon icon="themes" size={ 18 } />
			<div className="jetpack-updates-popover__text">
				{
					translate(
						'There is %(total)d theme update available. {{link}}View{{/link}}',
						'There are %(total)d theme updates available. {{link}}View{{/link}}',
						{
							components: {
								link:
									<a
										className="jetpack-updates-popover__link"
										onClick={ onClose }
										target="_blanck"
										href={ site.options.admin_url + 'update-core.php#update-themes-table' }
									>
										<Gridicon icon="external" size={ 12 } />
									</a>
							},
							count: updates.themes,
							args: {
								total: updates.themes
							}
						}
					)
				}
			</div>
		</div>
	);
};
