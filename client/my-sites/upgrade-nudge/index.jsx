/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';
import noop from 'lodash/noop';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import Gridicon from 'components/gridicon';
import analytics from 'lib/analytics';
import sitesList from 'lib/sites-list';
import { getValidFeatureKeys, hasFeature } from 'lib/plans';
import { isFreePlan } from 'lib/products-values';
import TrackComponentView from 'lib/analytics/track-component-view';
import { abtest } from 'lib/abtest';

const sites = sitesList();

export default React.createClass( {

	displayName: 'UpgradeNudge',

	propTypes: {
		onClick: React.PropTypes.func,
		className: React.PropTypes.string,
		message: React.PropTypes.string,
		icon: React.PropTypes.string,
		event: React.PropTypes.string,
		href: React.PropTypes.string,
		jetpack: React.PropTypes.bool,
		compact: React.PropTypes.bool,
		feature: React.PropTypes.oneOf( [ false, ...getValidFeatureKeys() ] ),
	},

	getDefaultProps() {
		return {
			onClick: noop,
			message: 'And get your own domain address.',
			icon: 'star',
			event: null,
			jetpack: false,
			feature: false,
			compact: false
		}
	},

	handleClick() {
		if ( this.props.event || this.props.feature ) {
			analytics.tracks.recordEvent( 'calypso_upgrade_nudge_cta_click', {
				cta_name: this.props.event,
				cta_feature: this.props.feature
			} );
		}
		this.props.onClick();
	},

	shouldDisplay( site ) {
		const { feature, jetpack } = this.props;
		if ( ! site ) {
			return false;
		}
		if ( feature && hasFeature( feature, site.siteID ) ) {
			return false;
		}
		if ( ! feature && ! isFreePlan( site.plan ) ) {
			return false;
		}
		if ( ! jetpack && site.jetpack || jetpack && ! site.jetpack ) {
			return false;
		}
		return true;
	},

	render() {
		const classes = classNames( this.props.className, 'upgrade-nudge' );

		const site = sites.getSelectedSite();
		let href = this.props.href;

		if ( ! this.shouldDisplay( site ) ) {
			return null;
		}

		if ( abtest( 'nudges' ) === 'hideAll' ) {
			return (
				<TrackComponentView eventName={ 'calypso_upgrade_nudge_hide' } eventProperties={ {
					cta_name: this.props.event,
					cta_feature: this.props.feature
				} } />
			);
		}

		if ( ! this.props.href && site ) {
			if ( this.props.feature ) {
				href = `/plans/compare/${ this.props.feature }/${ site.slug }`;
			} else {
				href = `/plans/${ site.slug }`;
			}
		}

		if ( this.props.compact ) {
			return (
				<Button className={ classes } onClick={ this.handleClick } href={ href }>
					<Gridicon className="upgrade-nudge__icon" icon={ this.props.icon } />
					<div className="upgrade-nudge__info">
						<span className="upgrade-nudge__title">
							{ this.props.title || this.translate( 'Upgrade to Premium' ) }
						</span>
						<span className="upgrade-nudge__message" >
							{ this.props.message }
						</span>
					</div>
				</Button>
			);
		}

		return (
			<Card compact className={ classes } onClick={ this.handleClick } href={ href }>
				<Gridicon className="upgrade-nudge__icon" icon={ this.props.icon } size={ 18 } />
				<div className="upgrade-nudge__info">
					<span className="upgrade-nudge__title">
						{ this.props.title || this.translate( 'Upgrade to Premium' ) }
					</span>
					<span className="upgrade-nudge__message" >
						{ this.props.message }
					</span>
				</div>
				{ ( this.props.event || this.props.feature ) &&
					<TrackComponentView eventName={ 'calypso_upgrade_nudge_impression' } eventProperties={ {
						cta_name: this.props.event,
						cta_feature: this.props.feature
					} } />
				}
			</Card>
		);
	}
} );
