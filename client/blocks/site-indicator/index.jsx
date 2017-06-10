/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { get } from 'lodash';
import { localize } from 'i18n-calypso';
import config from 'config';
import classNames from 'classnames';
import Gridicon from 'gridicons';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Animate from 'components/animate';
import DisconnectJetpackButton from 'my-sites/plugins/disconnect-jetpack/disconnect-jetpack-button';
import { recordGoogleEvent } from 'state/analytics/actions';

const renderSiteIndicatorCloseIcon = ( toggleExpand ) => {
	return (
		<button className="site-indicator__button" onClick={ toggleExpand }>
			<Animate type="appear">
				<Gridicon icon="cross" size={ 18 } />
			</Animate>
		</button>
	);
};

const SiteIndicatorMessage = ( props ) => {
	return (
		<div className="site-indicator__message">
			<div className="site-indicator__action">
				<span>
					{ props.children }
				</span>
			</div>
			{ renderSiteIndicatorCloseIcon( props.onClose ) }
		</div>
	);
};

const renderSiteIndicatorIcon = ( toggleExpand, icon = 'notice' ) => {
	return (
		<Animate type="appear">
			<button className="site-indicator__button" onClick={ toggleExpand }>
				{ /* eslint-disable wpcalypso/jsx-gridicon-size */ }
				<Gridicon icon={ icon } size={ 16 } />
				{ /* eslint-enable wpcalypso/jsx-gridicon-size */ }
			</button>
		</Animate>
	);
};

export const renderSiteIndicatorHasError = ( { translate, site, recordGoogleEvent: recordGAEvent }, expanded = false, toggleExpand ) => {
	const indicatorClass = classNames( {
		'is-expanded': expanded,
		'is-error': true,
		'is-action': true,
		'site-indicator': true
	} );

	return (
		<div className={ indicatorClass }>
			{ ! expanded && renderSiteIndicatorIcon( toggleExpand ) }
			{ expanded &&
				<SiteIndicatorMessage onClose={ toggleExpand }>
					{ translate( 'This site cannot be accessed.' ) }
					<DisconnectJetpackButton site={ site } text={ translate( 'Disconnect Site' ) } redirect="/sites" />
				</SiteIndicatorMessage>
			}
		</div>
	);
};

export const renderSiteIndicatorHasWarning = ( { translate, site, recordGoogleEvent: recordGAEvent }, expanded = false, toggleExpand ) => {
	const indicatorClass = classNames( {
		'is-expanded': expanded,
		'is-warning': true,
		'is-action': true,
		'site-indicator': true
	} );

	return (
		<div className={ indicatorClass }>
			{ ! expanded && renderSiteIndicatorIcon( toggleExpand ) }
			{ expanded &&
				<SiteIndicatorMessage onClose={ toggleExpand } >
					{ translate( 'Jetpack %(version)s is required', { args: { version: config( 'jetpack_min_version' ) } } ) }.
					<a
						href={ site.options.admin_url + 'plugins.php?plugin_status=upgrade' }
						>{ translate( 'Update now' ) }
					</a>.
				</SiteIndicatorMessage>
			}
		</div>
	);
};

export const renderSiteIndicatorHasUpdate = ( { translate, site, recordGoogleEvent: recordGAEvent }, expanded = false, toggleExpand ) => {
	const indicatorClass = classNames( {
		'is-expanded': expanded,
		'is-update': true,
		'is-action': true,
		'site-indicator': true
	} );

	const onlyPlugins = site.updates.plugins === site.updates.total;

	return (
		<div className={ indicatorClass }>
			{ ! expanded && renderSiteIndicatorIcon( toggleExpand, 'sync' ) }
			{ expanded &&
				<SiteIndicatorMessage onClose={ toggleExpand }>
				<a href={ onlyPlugins ? '/plugins/updates/' + site.slug : site.options.admin_url + 'update-core.php' } >
					{ onlyPlugins
						? translate(
							'There is a plugin update available.',
							'There are plugin updates available.',
							{ count: site.updates.total }
						) : translate(
							'There is an update available.',
							'There are updates available.',
							{ count: this.props.site.updates.total }
						)
					}
				</a>
				</SiteIndicatorMessage>
			}
		</div>
	);
};

export class SiteIndicator extends Component {
	constructor( props ) {
		super( props );
		this.state = { expand: false };
		this.toggleExpand = this.toggleExpand.bind( this );
	}

	toggleExpand() {
		this.setState( {
			updateError: false,
			updateSucceed: false,
			expand: ! this.state.expand
		} );
		this.props.recordGoogleEvent(
			'Site-Indicator',
			'Clicked to ' + ( ! this.state.expand ? 'Expand' : 'Collapse' ) + ' the Site Indicator'
		);
	}

	hasUpdate() {
		const { site } = this.props;
		return !! get( site, 'updates.total' );
	}

	hasError() {
		const { site } = this.props;
		if ( site.unreachable ) {
			return true;
		}
		return false;
	}

	hasWarning() {
		const { site } = this.props;

		if ( site.hasMinimumJetpackVersion && site.unreachable === false ) {
			return false;
		}

		if ( site.callingHome ) {
			return false;
		} else if ( typeof site.unreachable === 'undefined' ) {
			if ( 'function' === typeof site.callHome ) {
				site.callHome();
			}
			return false;
		}

		return true;
	}

	render() {
		const { site } = this.props;

		if ( ! site.jetpack ) {
			return null;
		}

		if ( this.hasError() ) {
			return renderSiteIndicatorHasError( this.props, this.state.expand, this.toggleExpand );
		}

		if ( this.hasWarning() ) {
			return renderSiteIndicatorHasWarning( this.props, this.state.expand, this.toggleExpand );
		}

		if ( this.hasUpdate() && site.canUpdateFiles ) {
			return renderSiteIndicatorHasUpdate( this.props, this.state.expand, this.toggleExpand );
		}
		return null;
	}
}

SiteIndicator.displayName = 'SiteIndicator';
SiteIndicator.propTypes = {
	site: PropTypes.object.isRequired
};

export default connect(
	null,
	{
		recordGoogleEvent
	}
)( localize( SiteIndicator ) );
