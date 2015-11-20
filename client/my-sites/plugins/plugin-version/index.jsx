/**
 * External dependencies
 */
var React = require( 'react/addons' ),
	classNames = require( 'classnames' );

/**
 * Internal dependencies
 */
var Gridicon = require( 'components/gridicon' ),
	PluginsUtil = require( 'lib/plugins/utils' );

module.exports = React.createClass( {

	displayName: 'PluginVersion',

	getCurrentUpdatingToVersion: function() {
		return ( this.props.site &&
			this.props.notices &&
			this.props.notices.inProgress &&
			PluginsUtil.filterNotices( this.props.notices.inProgress, this.props.site, this.props.plugin.slug ).length &&
			PluginsUtil.filterNotices( this.props.notices.inProgress, this.props.site, this.props.plugin.slug )[ 0 ].plugin.update &&
			PluginsUtil.filterNotices( this.props.notices.inProgress, this.props.site, this.props.plugin.slug )[ 0 ].plugin.update.new_version );
	},

	render: function() {
		let version = this.props.plugin && this.props.plugin.version ?
			this.translate( 'Version %(pluginVersion)s', { args: { pluginVersion: this.props.plugin.version } } ) : null;

		const wpVersion = this.props.plugin && this.props.plugin.version && this.props.site && this.props.site.options.software_version && this.props.site.jetpack ?
			this.translate( 'WordPress %(WordPressVersion)s', {
				args: { WordPressVersion: this.props.site.options.software_version }
			} ) : null;

		// In case of WordPress.com Plugins
		version = this.props.plugin && this.props.plugin.wpcom ? this.translate( 'Updated Automatically' ) : version;

		const hasUpdate = this.props.plugin && this.props.plugin.update && this.props.plugin.version !== this.props.plugin.update.new_version;

		// In case of the version needing an update
		version = hasUpdate ? this.translate( '{{icon/}} Version %(pluginVersion)s', {
			args: { pluginVersion: this.props.plugin.version },
			components: { icon: <Gridicon icon="sync" size={ 16 } /> }
		} ) : version;

		// In case of an update happening
		const updatingToVersion = this.getCurrentUpdatingToVersion();

		version = updatingToVersion ? this.translate( '{{icon/}} Updating to Version %(pluginVersion)s', {
			args: { pluginVersion: updatingToVersion },
			components: { icon: <Gridicon icon="sync" size={ 16 } /> }
		} ) : version;

		const classes = classNames( {
			'plugin-version__plugin': true,
			'has-update': hasUpdate && ! updatingToVersion
		} );

		version = version ? <span className={ classes }>{ version }</span> : null;

		return <div className="plugin-version">{ version } { wpVersion }</div>;
	}
} );
