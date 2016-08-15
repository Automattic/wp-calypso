/** @ssr-ready **/

/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';
import noop from 'lodash/noop';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import Gridicon from 'components/gridicon';
import analytics from 'lib/analytics';
import { getValidFeatureKeys, hasFeature } from 'lib/plans';
import { isFreePlan } from 'lib/products-values';
import TrackComponentView from 'lib/analytics/track-component-view';
import { getSelectedSite } from 'state/ui/selectors';

const UpgradeNudge = React.createClass( {

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
		shouldDisplay: React.PropTypes.func
	},

	getDefaultProps() {
		return {
			onClick: noop,
			message: 'And get your own domain address.',
			icon: 'star',
			event: null,
			jetpack: false,
			feature: false,
			compact: false,
			shouldDisplay: null
		};
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
		const { feature, jetpack, shouldDisplay } = this.props;
		if ( shouldDisplay ) {
			return shouldDisplay();
		}
		if ( ! site ) {
			return false;
		}
		if ( feature && hasFeature( feature, site.ID ) ) {
			return false;
		}
		if ( ! feature && ! isFreePlan( site.plan ) ) {
			return false;
		}
		if ( feature === 'no-adverts' && site.options.wordads ) {
			return false;
		}
		if ( ! jetpack && site.jetpack || jetpack && ! site.jetpack ) {
			return false;
		}
		return true;
	},

	render() {
		const {
			translate,
			site,
			compact,
			icon,
			className,
			event,
			feature,
			title,
			message
		} = this.props;

		const classes = classNames( className, 'upgrade-nudge' );
		let href = this.props.href;

		if ( ! this.shouldDisplay( site ) ) {
			return null;
		}

		if ( ! this.props.href && site ) {
			if ( feature ) {
				href = `/plans/${ site.slug }?feature=${ feature }`;
			} else {
				href = `/plans/${ site.slug }`;
			}
		}

		if ( compact ) {
			return (
				<Button className={ classes } onClick={ this.handleClick } href={ href }>
					<Gridicon className="upgrade-nudge__icon" icon={ icon } />
					<div className="upgrade-nudge__info">
						<span className="upgrade-nudge__title">
							{ title || translate( 'Upgrade to Premium' ) }
						</span>
						<span className="upgrade-nudge__message" >
							{ message }
						</span>
					</div>
				</Button>
			);
		}

		return (
			<Card compact className={ classes } onClick={ this.handleClick } href={ href }>
				<Gridicon className="upgrade-nudge__icon" icon={ icon } size={ 18 } />
				<div className="upgrade-nudge__info">
					<span className="upgrade-nudge__title">
						{ title || translate( 'Upgrade to Premium' ) }
					</span>
					<span className="upgrade-nudge__message" >
						{ message }
					</span>
				</div>
				{ ( event || feature ) &&
					<TrackComponentView eventName={ 'calypso_upgrade_nudge_impression' } eventProperties={ {
						cta_name: event,
						cta_feature: feature
					} } />
				}
			</Card>
		);
	}
} );

const mapStateToProps = state => {
	return {
		site: getSelectedSite( state )
	};
}

export default connect( mapStateToProps )( localize( UpgradeNudge ) );
