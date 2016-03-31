/**
* External dependencies
*/
import React from 'react';
import classNames from 'classnames';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

/**
* Internal dependencies
*/
import Card from 'components/card';
import CompactCard from 'components/card/compact';
import Button from 'components/button';
import Gridicon from 'components/gridicon';
import Spinner from 'components/spinner';
import JetpackManageErrorPage from 'my-sites/jetpack-manage-error-page';
import { fetchInstallInstructions, startPlugin, installPlugin, finishAllPlugins } from 'state/plugins/premium/actions';
import PremiumSelectors from 'state/plugins/premium/selectors';
import PluginsStore from 'lib/plugins/store';

const helpLinks = {
	vaultpress: 'https://en.support.wordpress.com/setting-up-premium-services/#vaultpress',
	akismet: 'https://en.support.wordpress.com/setting-up-premium-services/#akismet',
	polldaddy: 'https://en.support.wordpress.com/setting-up-premium-services/#polldaddy',
}

const PlansSetup = React.createClass( {
	displayName: 'PlanSetup',

	doingText( slug ) {
		switch ( slug ) {
			case 'vaultpress':
				return this.translate( '{{b}}VaultPress{{/b}} is backing up your site', { components: { b: <strong /> } } );
			case 'akismet':
				return this.translate( '{{b}}Akismet{{/b}} is checking for spam', { components: { b: <strong /> } } );
			case 'polldaddy':
				return this.translate( '{{b}}Polldaddy{{/b}} doesn\'t have an active state?', { components: { b: <strong /> } } );
		}
		return null;
	},

	componentDidMount() {
		this.props.fetchInstallInstructions( this.props.selectedSite.ID );
	},

	renderNoManageWarning() {
		return (
			<JetpackManageErrorPage
				site={ this.props.selectedSite }
				template={ 'optInManage' }
				title={ this.translate( 'Oh no! We can\'t automatically install your new plugins.' ) }
				section={ 'plugins' }
				illustration={ '/calypso/images/jetpack/jetpack-manage.svg' } />
		);
	},

	renderNoJetpackSiteSelected() {
		return (
			<JetpackManageErrorPage
				site={ this.props.selectedSite }
				title={ this.translate( 'Oh no! You need to select a jetpack site to be able to setup your plan' ) }
				illustration={ '/calypso/images/jetpack/jetpack-manage.svg' } />
		);
	},

	onNextClick( pluginSlug ) {
		return () => {
			let getPlugin;
			let install = this.props.installPlugin;
			let site = this.props.selectedSite;
			this.props.startPlugin( pluginSlug, site.ID );

			getPlugin = function() {
				let plugin = PluginsStore.getSitePlugin( site, pluginSlug );
				if ( ! plugin && PluginsStore.isFetchingSite( site ) ) {
					// if the Plugins are still being fetched, we wait. We are not using flux
					// store events because it would be more messy to handle the one-time-only
					// callback with bound parameters than to do it this way.
					return setTimeout( getPlugin, 500 );
				};
				plugin = plugin || { slug: pluginSlug };
				// Install the plugin. `installer` is a promise, so we can wait for the install
				// to finish before trying to configure the plugin.
				install( plugin, site );
			}
			getPlugin();
		}
	},

	onFinishClick( pluginSlug ) {
		return () => {
			let site = this.props.selectedSite;
			this.props.finishAllPlugins( pluginSlug, site.ID );
		}
	},

	renderStart() {
		let site = this.props.selectedSite;
		let nextPlugin = PremiumSelectors.getNextPlugin( this.props.plugins, site.ID );

		return (
			<div className="plan-setup">
				<Card className="plan-setup__plugin-header start">
					{ 'Installing your new plugins' }
				</Card>
				<CompactCard>
					{ 'Here\'s some info about setting up your new Business Plan. You can also manually install the plugins by following this help doc(?).' }
				</CompactCard>
				<CompactCard className="plan-setup__action">
					<Button primary onClick={ this.onNextClick( nextPlugin.slug ) }>{ 'Let\'s go!' }</Button>
					<span className="plan-setup__action-content">{ this.translate( 'We\'ll start with %(plugin)s', { args: { plugin: nextPlugin.name } } ) }</span>
				</CompactCard>
			</div>
		);
	},

	renderFinish() {
		let site = this.props.selectedSite;
		let plugins = PremiumSelectors.getPluginsForSite( this.props.plugins, site.ID );
		let pluginsContent = plugins.map( ( item, key ) => {
			let errorContent;
			if ( item.error !== null ) {
				errorContent = (
					<div className="plan-setup__message">
						{ this.translate( 'Install failed. {{a}}Manually install and activate{{/a}} with your registration key: {{code}}%(key)s{{/code}}', {
							args: { key: item.key },
							components: {
								a: <a href={ helpLinks[item.slug] } />,
								code: <code />
							}
						} ) }
					</div>
				);
			}
			if ( item.error !== null ) {
				return (
					<CompactCard key={ key } className="plan-setup__status">
						<strong className="plan-setup__status-name">{ item.name }</strong>
						<Gridicon icon="notice" />
						{ errorContent }
					</CompactCard>
				);
			}
			return (
				<CompactCard key={ key } className="plan-setup__status">
					<span className="plan-setup__status-name">{ this.doingText( item.slug ) }</span>
					<Gridicon icon="checkmark-circle" />
				</CompactCard>
			);
		} );

		return (
			<div className="plan-setup">
				<Card className="plan-setup__plugin-header finished">
					{ 'We\'ve set up your plugins!' }
				</Card>
				{ pluginsContent }
				<CompactCard className="plan-setup__action">
					{ 'Where should they go next?' }
				</CompactCard>
			</div>
		);
	},

	renderPlugin( plugin ) {
		let actionContent, errorContent, errorActionContent;
		let site = this.props.selectedSite;
		let nextPlugin = PremiumSelectors.getNextPlugin( this.props.plugins, site.ID );

		if ( plugin.error !== null ) {
			errorActionContent = (
				<div>
					{ this.translate( 'We can\'t finish the setup of this plugin due to an error. You can manually install it with instructions later.' ) }
				</div>
			);
		}

		if ( PremiumSelectors.isFinished( this.props.plugins, site.ID ) ) {
			actionContent = (
				<div>
					{ errorActionContent }
					<Button primary onClick={ this.onFinishClick( plugin.slug ) }>{ 'Continue' }</Button>
					<span className="plan-setup__action-content">{ 'All finished!' }</span>
				</div>
			);
		} else if ( plugin.status.done === true || ( plugin.error !== null ) ) {
			actionContent = (
				<div>
					{ errorActionContent }
					<Button primary onClick={ this.onNextClick( nextPlugin.slug ) }>{ 'Let\'s go!' }</Button>
					<span className="plan-setup__action-content">{ this.translate( 'Now we\'ll install %(plugin)s', { args: { plugin: nextPlugin.name } } ) }</span>
				</div>
			);
		} else if ( plugin.status.install !== false ) {
			actionContent = (
				<span className="plan-setup__action-content">{ 'Working…' }</span>
			);
		} else {
			actionContent = (
				<span className="plan-setup__action-content">{ 'Almost done…' }</span>
			);
		}

		if ( plugin.error !== null ) {
			errorContent = <span className="plan-setup__error">{ plugin.error.message }</span>
		}

		return (
			<div className="plan-setup">
				<Card className={ classNames( 'plan-setup__plugin-header', plugin.slug ) }>
					{ this.translate( 'Installing %(plugin)s', { args: { plugin: plugin.name } } ) }
				</Card>
				<CompactCard>
					{ this.translate( 'We\'re getting your %(plugin)s plugin setup and ready. We\'ll let you know when it\'s done, or if an error occurs along the way.', { args: { plugin: plugin.name } } ) }
				</CompactCard>
				<CompactCard className="plan-setup__status">
					<span className="plan-setup__status-name">{ 'Installing' }</span>
					{ ( plugin.status.install === true ) && ( plugin.error !== null ? <Gridicon icon="notice" /> : <Spinner /> ) }
					{ ( plugin.status.install === false ) && <Gridicon icon="checkmark-circle" /> }
					{ ( plugin.status.install === true ) && errorContent }
				</CompactCard>
				<CompactCard className="plan-setup__status">
					<span className="plan-setup__status-name">{ 'Activating' }</span>
					{ ( plugin.status.activate === true ) && ( plugin.error !== null ? <Gridicon icon="notice" /> : <Spinner /> ) }
					{ ( plugin.status.activate === false ) && <Gridicon icon="checkmark-circle" /> }
					{ ( plugin.status.activate === true ) && errorContent }
				</CompactCard>
				<CompactCard className="plan-setup__status">
					<span className="plan-setup__status-name">{ 'Configuring' }</span>
					{ ( plugin.status.config === true ) && ( plugin.error !== null ? <Gridicon icon="notice" /> : <Spinner /> ) }
					{ ( plugin.status.config === false ) && <Gridicon icon="checkmark-circle" /> }
					{ ( plugin.status.config === true ) && errorContent }
				</CompactCard>
				<CompactCard className="plan-setup__status">
					<span className="plan-setup__status-name">{ 'Finished' }</span>
					{ ( plugin.status.done === true ) && <Gridicon icon="checkmark-circle" /> }
				</CompactCard>
				<CompactCard className="plan-setup__action">
					{ actionContent }
				</CompactCard>
			</div>
		);
	},

	render() {
		let site = this.props.selectedSite;
		if ( ! site || ! site.jetpack ) {
			return this.renderNoJetpackSiteSelected();
		}
		if ( ! site.canManage() ) {
			return this.renderNoManageWarning();
		}

		if ( PremiumSelectors.isRequesting( this.props.isRequesting, site.ID ) ) {
			return null;
		}

		let content;
		let plugin = PremiumSelectors.getActivePlugin( this.props.plugins, site.ID );
		if ( plugin ) {
			content = this.renderPlugin( plugin );
		} else if ( PremiumSelectors.isFinished( this.props.plugins, site.ID ) ) {
			content = this.renderFinish();
		} else {
			content = this.renderStart();
		}

		return (
			<div>
				<h1 className="plan-setup__header">{ this.translate( 'Setting up your Business Plan' ) }</h1>
				{ content }
			</div>
		);
	}

} );

export default connect(
	state => {
		return state.plugins.premium
	},
	dispatch => bindActionCreators( { fetchInstallInstructions, startPlugin, installPlugin, finishAllPlugins }, dispatch )
)( PlansSetup );
