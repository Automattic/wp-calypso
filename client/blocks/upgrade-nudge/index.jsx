/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { identity, noop } from 'lodash';
import { localize } from 'i18n-calypso';
import Gridicon from 'components/gridicon';

/**
 * Internal dependencies
 */
import { Button, Card } from '@automattic/components';
import { FEATURE_NO_ADS } from 'lib/plans/constants';
import { addQueryArgs } from 'lib/url';
import { hasFeature } from 'state/sites/plans/selectors';
import { isFreePlan } from 'lib/products-values';
import TrackComponentView from 'lib/analytics/track-component-view';
import { recordTracksEvent } from 'state/analytics/actions';
import canCurrentUser from 'state/selectors/can-current-user';
import isVipSite from 'state/selectors/is-vip-site';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSite } from 'state/sites/selectors';

/**
 * Style dependencies
 */
import './style.scss';

export class UpgradeNudge extends React.Component {
	static propTypes = {
		onClick: PropTypes.func,
		className: PropTypes.string,
		message: PropTypes.string,
		icon: PropTypes.string,
		event: PropTypes.string,
		href: PropTypes.string,
		jetpack: PropTypes.bool,
		compact: PropTypes.bool,
		plan: PropTypes.string,
		feature: PropTypes.string,
		forceDisplay: PropTypes.bool,
		site: PropTypes.object,
		translate: PropTypes.func,
	};

	static defaultProps = {
		onClick: noop,
		message: 'And get your own domain address.',
		icon: 'star',
		event: null,
		jetpack: false,
		plan: null,
		feature: null,
		compact: false,
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

	render() {
		const {
			canManageSite,
			className,
			compact,
			event,
			forceDisplay,
			plan,
			planHasFeature,
			feature,
			icon,
			jetpack,
			message,
			site,
			title,
			translate,
			isVip,
		} = this.props;

		const shouldNotDisplay =
			isVip ||
			! canManageSite ||
			! site ||
			typeof site !== 'object' ||
			typeof site.jetpack !== 'boolean' ||
			( feature && planHasFeature ) ||
			( ! feature && ! isFreePlan( site.plan ) ) ||
			( feature === FEATURE_NO_ADS && site.options.wordads ) ||
			( ! jetpack && site.jetpack ) ||
			( jetpack && ! site.jetpack );

		if ( shouldNotDisplay && ! forceDisplay ) {
			return null;
		}

		let href = this.props.href;
		if ( ! href && site ) {
			href = addQueryArgs( { feature, plan }, `/plans/${ site.slug }` );
		}

		const classes = classNames( 'upgrade-nudge', className );

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

		return {
			site: getSite( state, siteId ),
			planHasFeature: hasFeature( state, siteId, ownProps.feature ),
			canManageSite: canCurrentUser( state, siteId, 'manage_options' ),
			isVip: isVipSite( state, siteId ),
		};
	},
	{ recordTracksEvent }
)( localize( UpgradeNudge ) );
