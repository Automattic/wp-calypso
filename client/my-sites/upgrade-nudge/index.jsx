/** @format */

/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { identity, noop } from 'lodash';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import { hasFeature } from 'state/sites/plans/selectors';
import { getValidFeatureKeys } from 'lib/plans';
import { isFreePlan } from 'lib/products-values';
import TrackComponentView from 'lib/analytics/track-component-view';
import { userCan } from 'lib/site/utils';
import { recordTracksEvent } from 'state/analytics/actions';
import { getSelectedSite, getSelectedSiteId } from 'state/ui/selectors';

class UpgradeNudge extends React.Component {
	static propTypes = {
		onClick: PropTypes.func,
		className: PropTypes.string,
		message: PropTypes.string,
		icon: PropTypes.string,
		event: PropTypes.string,
		href: PropTypes.string,
		jetpack: PropTypes.bool,
		compact: PropTypes.bool,
		feature: PropTypes.oneOf( [ false, ...getValidFeatureKeys() ] ),
		shouldDisplay: PropTypes.func,
		site: PropTypes.object,
		translate: PropTypes.func,
	};

	static defaultProps = {
		onClick: noop,
		message: 'And get your own domain address.',
		icon: 'star',
		event: null,
		jetpack: false,
		feature: false,
		compact: false,
		shouldDisplay: null,
		site: null,
		translate: identity,
	};

	handleClick = () => {
		const { event, feature, onClick, recordTracksEvent: recordTracks } = this.props;

		if ( event || feature ) {
			recordTracks( 'calypso_upgrade_nudge_cta_click', {
				cta_name: event,
				cta_feature: feature,
				cta_size: 'regular',
			} );
		}

		onClick();
	};

	shouldDisplay() {
		const { feature, jetpack, planHasFeature, shouldDisplay, site, userCanManageSite } = this.props;

		if ( shouldDisplay ) {
			return shouldDisplay();
		}

		if ( ! userCanManageSite ) {
			return false;
		}

		if ( ! site || typeof site !== 'object' || typeof site.jetpack !== 'boolean' ) {
			return false;
		}

		if ( feature && planHasFeature ) {
			return false;
		}

		if ( ! feature && ! isFreePlan( site.plan ) ) {
			return false;
		}

		if ( feature === 'no-adverts' && site.options.wordads ) {
			return false;
		}

		if ( ( ! jetpack && site.jetpack ) || ( jetpack && ! site.jetpack ) ) {
			return false;
		}

		return true;
	}

	render() {
		const {
			className,
			compact,
			event,
			feature,
			icon,
			message,
			site,
			title,
			translate,
		} = this.props;
		const classes = classNames( className, 'upgrade-nudge' );
		let { href } = this.props;

		if ( ! this.shouldDisplay() ) {
			return null;
		}

		if ( ! href && site ) {
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
						<span className="upgrade-nudge__message">{ message }</span>
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
					<span className="upgrade-nudge__message">{ message }</span>
				</div>

				{ ( event || feature ) && (
					<TrackComponentView
						eventName={ 'calypso_upgrade_nudge_impression' }
						eventProperties={ {
							cta_name: event,
							cta_feature: feature,
							cta_size: 'regular',
						} }
					/>
				) }
			</Card>
		);
	}
}

export default connect(
	( state, ownProps ) => {
		const siteId = getSelectedSiteId( state );
		const site = getSelectedSite( state );

		return {
			site,
			planHasFeature: hasFeature( state, siteId, ownProps.feature ),
			userCanManageSite: userCan( 'manage_options', site ),
		};
	},
	{ recordTracksEvent }
)( localize( UpgradeNudge ) );
