import {
	planMatches,
	isBloggerPlan,
	isPersonalPlan,
	isPremiumPlan,
	isBusinessPlan,
	isEcommercePlan,
	GROUP_JETPACK,
	GROUP_WPCOM,
} from '@automattic/calypso-products';
import { Button, Card, Gridicon, PlanPrice } from '@automattic/components';
import { isMobile } from '@automattic/viewport';
import clsx from 'clsx';
import DOMPurify from 'dompurify';
import { size } from 'lodash';
import PropTypes from 'prop-types';
import { Component, isValidElement } from 'react';
import { connect } from 'react-redux';
import DismissibleCard from 'calypso/blocks/dismissible-card';
import JetpackLogo from 'calypso/components/jetpack-logo';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import { preventWidows } from 'calypso/lib/formatting';
import { addQueryArgs } from 'calypso/lib/url';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';

import './style.scss';

const noop = () => {};

export class Banner extends Component {
	static propTypes = {
		callToAction: PropTypes.oneOfType( [ PropTypes.string, PropTypes.element ] ),
		secondaryCallToAction: PropTypes.oneOfType( [ PropTypes.string, PropTypes.element ] ),
		className: PropTypes.string,
		compactButton: PropTypes.bool,
		description: PropTypes.oneOfType( [ PropTypes.node, PropTypes.symbol ] ),
		forceHref: PropTypes.bool,
		disableCircle: PropTypes.bool,
		disableHref: PropTypes.bool,
		dismissPreferenceName: PropTypes.string,
		dismissTemporary: PropTypes.bool,
		dismissWithoutSavingPreference: PropTypes.bool,
		event: PropTypes.string,
		secondaryEvent: PropTypes.string,
		feature: PropTypes.string,
		horizontal: PropTypes.bool,
		href: PropTypes.string,
		icon: PropTypes.oneOfType( [ PropTypes.string, PropTypes.element ] ),
		iconPath: PropTypes.string,
		jetpack: PropTypes.bool,
		isAtomic: PropTypes.bool,
		compact: PropTypes.bool,
		list: PropTypes.oneOfType( [
			PropTypes.arrayOf( PropTypes.string ),
			PropTypes.arrayOf( PropTypes.object ),
		] ),
		renderListItem: PropTypes.func,
		onClick: PropTypes.func,
		secondaryOnClick: PropTypes.func,
		onDismiss: PropTypes.func,
		plan: PropTypes.string,
		price: PropTypes.oneOfType( [ PropTypes.number, PropTypes.arrayOf( PropTypes.number ) ] ),
		primaryButton: PropTypes.bool,
		showIcon: PropTypes.bool,
		siteSlug: PropTypes.string,
		target: PropTypes.string,
		title: PropTypes.node.isRequired,
		tracksImpressionName: PropTypes.string,
		tracksClickName: PropTypes.string,
		tracksDismissName: PropTypes.string,
		tracksImpressionProperties: PropTypes.object,
		tracksClickProperties: PropTypes.object,
		tracksDismissProperties: PropTypes.object,
		customerType: PropTypes.string,
		isSiteWPForTeams: PropTypes.bool,
		displayAsLink: PropTypes.bool,
		showLinkIcon: PropTypes.bool,
		extraContent: PropTypes.node,
		isBusy: PropTypes.bool,
	};

	static defaultProps = {
		forceHref: false,
		disableCircle: false,
		disableHref: false,
		dismissTemporary: false,
		compact: false,
		compactButton: true,
		horizontal: false,
		jetpack: false,
		isAtomic: false,
		onClick: noop,
		secondaryOnClick: noop,
		onDismiss: noop,
		primaryButton: true,
		showIcon: true,
		tracksImpressionName: 'calypso_banner_cta_impression',
		tracksClickName: 'calypso_banner_cta_click',
		tracksDismissName: 'calypso_banner_dismiss',
		isSiteWPForTeams: false,
		isBusy: false,
	};

	getHref() {
		const { canUserUpgrade, feature, href, plan, siteSlug, customerType } = this.props;

		if ( ! href && siteSlug && canUserUpgrade ) {
			if ( customerType ) {
				return `/plans/${ siteSlug }?customerType=${ customerType }`;
			}
			const baseUrl = `/plans/${ siteSlug }`;
			if ( feature || plan ) {
				return addQueryArgs(
					{
						feature,
						plan,
					},
					baseUrl
				);
			}
			return baseUrl;
		}
		return href;
	}

	handleClick = ( e ) => {
		const { event, feature, compact, onClick, tracksClickName, tracksClickProperties } = this.props;

		if ( event && tracksClickName ) {
			this.props.recordTracksEvent?.( tracksClickName, {
				cta_name: event,
				cta_feature: feature,
				cta_size: compact ? 'compact' : 'regular',
				...tracksClickProperties,
			} );
		}

		onClick( e );
	};

	handleSecondaryClick = ( e ) => {
		const {
			secondaryEvent,
			secondaryOnClick,
			feature,
			compact,
			tracksClickName,
			tracksClickProperties,
		} = this.props;

		if ( secondaryEvent && tracksClickName ) {
			this.props.recordTracksEvent?.( tracksClickName, {
				cta_name: secondaryEvent,
				cta_feature: feature,
				cta_size: compact ? 'compact' : 'regular',
				...tracksClickProperties,
			} );
		}

		secondaryOnClick( e );
	};

	handleDismiss = ( e ) => {
		const { event, feature, onDismiss, tracksDismissName, tracksDismissProperties } = this.props;

		if ( event && tracksDismissName ) {
			this.props.recordTracksEvent?.( tracksDismissName, {
				cta_name: event,
				cta_feature: feature,
				...tracksDismissProperties,
			} );
		}

		onDismiss( e );
	};

	getIcon() {
		const { disableCircle, icon, iconPath, jetpack, showIcon, isAtomic } = this.props;

		if ( ! showIcon ) {
			return;
		}

		if ( jetpack && ! isAtomic ) {
			return (
				<div className="banner__icon-plan">
					<JetpackLogo size={ 32 } />
				</div>
			);
		}

		let iconComponent;
		if ( iconPath ) {
			iconComponent = <img src={ iconPath } alt="" />;
		} else if ( isValidElement( icon ) ) {
			iconComponent = icon;
		} else {
			iconComponent = <Gridicon icon={ icon || 'star' } size={ isMobile() ? 24 : 18 } />;
		}

		return (
			<div className="banner__icons">
				<div className="banner__icon">{ iconComponent }</div>
				{ ! disableCircle && <div className="banner__icon-circle">{ iconComponent }</div> }
				{ disableCircle && iconComponent && (
					<div className="banner__icon-no-circle">{ iconComponent }</div>
				) }
			</div>
		);
	}

	sanitize( html ) {
		// Getting an instance of DOMPurify this way is needed to fix a related JEST test.
		return DOMPurify.sanitize( html, {
			ALLOWED_TAGS: [ 'a' ],
			ALLOWED_ATTR: [ 'href', 'target' ],
		} );
	}

	renderDescription( description ) {
		if ( ! description ) {
			return null;
		}
		if ( typeof description === 'string' ) {
			return (
				<div
					className="banner__description"
					dangerouslySetInnerHTML={ { __html: this.sanitize( description ) } } // eslint-disable-line react/no-danger
				></div>
			);
		}
		return <div className="banner__description">{ description }</div>;
	}

	getContent() {
		const {
			callToAction,
			secondaryCallToAction,
			forceHref,
			secondaryHref,
			description,
			event,
			feature,
			compact,
			list,
			renderListItem,
			price,
			primaryButton,
			compactButton,
			title,
			target,
			tracksImpressionName,
			tracksImpressionProperties,
			extraContent,
			isBusy,
		} = this.props;

		const prices = Array.isArray( price ) ? price : [ price ];

		return (
			<div className="banner__content">
				{ tracksImpressionName && event && (
					<TrackComponentView
						eventName={ tracksImpressionName }
						eventProperties={ {
							cta_name: event,
							cta_feature: feature,
							cta_size: compact ? 'compact' : 'regular',
							...tracksImpressionProperties,
						} }
					/>
				) }
				<div className="banner__info">
					<div className="banner__title">{ title }</div>
					{ this.renderDescription( description ) }
					{ size( list ) > 0 && (
						<ul className="banner__list">
							{ list.map( ( item, key ) => (
								<li key={ key }>
									{ renderListItem?.( item ) ?? (
										<>
											<Gridicon icon="checkmark" size={ 18 } />
											{ item }
										</>
									) }
								</li>
							) ) }
						</ul>
					) }
					{ extraContent }
				</div>
				{ ( callToAction || price ) && (
					<div className="banner__action">
						{ size( prices ) === 1 && <PlanPrice rawPrice={ prices[ 0 ] } /> }
						{ size( prices ) === 2 && (
							<div className="banner__prices">
								<PlanPrice rawPrice={ prices[ 0 ] } original />
								<PlanPrice rawPrice={ prices[ 1 ] } discounted />
							</div>
						) }
						{ callToAction &&
							( forceHref ? (
								<Button
									compact={ compactButton }
									primary={ primaryButton }
									target={ target }
									busy={ isBusy }
								>
									{ preventWidows( callToAction ) }
								</Button>
							) : (
								<Button
									compact={ compactButton }
									href={ this.getHref() }
									onClick={ this.handleClick }
									primary={ primaryButton }
									target={ target }
									busy={ isBusy }
								>
									{ preventWidows( callToAction ) }
								</Button>
							) ) }

						{ secondaryCallToAction && (
							<Button
								compact={ compactButton }
								href={ secondaryHref }
								onClick={ this.handleSecondaryClick }
								primary={ false }
							>
								{ preventWidows( secondaryCallToAction ) }
							</Button>
						) }
					</div>
				) }
			</div>
		);
	}

	render() {
		const {
			callToAction,
			className,
			compact,
			disableHref,
			dismissPreferenceName,
			dismissWithoutSavingPreference,
			dismissTemporary,
			forceHref,
			horizontal,
			jetpack,
			isAtomic,
			plan,
			displayAsLink,
			showLinkIcon,
		} = this.props;

		// For P2 sites, only show banners if they have the 'p2-banner' class.
		if ( this.props.isSiteWPForTeams ) {
			if ( 'string' !== typeof className || ! className.split( ' ' ).includes( 'p2-banner' ) ) {
				return null;
			}
		}

		const classes = clsx(
			'banner',
			className,
			{ 'has-call-to-action': callToAction },
			{ 'is-upgrade-blogger': plan && isBloggerPlan( plan ) },
			{ 'is-upgrade-personal': plan && isPersonalPlan( plan ) },
			{ 'is-upgrade-premium': plan && isPremiumPlan( plan ) },
			{ 'is-upgrade-business': plan && isBusinessPlan( plan ) },
			{ 'is-upgrade-ecommerce': plan && isEcommercePlan( plan ) },
			{ 'is-jetpack-plan': plan && planMatches( plan, { group: GROUP_JETPACK } ) },
			{ 'is-wpcom-plan': plan && planMatches( plan, { group: GROUP_WPCOM } ) },
			{ 'is-compact': compact },
			{ 'is-dismissible': dismissPreferenceName || dismissWithoutSavingPreference },
			{ 'is-horizontal': horizontal },
			{ 'is-jetpack': jetpack },
			{ 'is-atomic': isAtomic }
		);
		const href = ( disableHref || callToAction ) && ! forceHref ? null : this.getHref();
		if ( dismissPreferenceName ) {
			return (
				<DismissibleCard
					className={ classes }
					preferenceName={ dismissPreferenceName }
					temporary={ dismissTemporary }
					onClick={ this.handleDismiss }
					href={ href }
				>
					{ this.getIcon() }
					{ this.getContent() }
				</DismissibleCard>
			);
		}

		return (
			<Card
				className={ classes }
				href={ href }
				onClick={ callToAction && ! forceHref ? null : this.handleClick }
				displayAsLink={ displayAsLink }
				showLinkIcon={ showLinkIcon }
			>
				{ dismissWithoutSavingPreference && (
					<Gridicon icon="cross" className="banner__close-icon" onClick={ this.handleDismiss } />
				) }
				{ this.getIcon() }
				{ this.getContent() }
			</Card>
		);
	}
}

const mapStateToProps = ( state, ownProps ) => ( {
	siteSlug: ownProps.disableHref ? null : getSelectedSiteSlug( state ),
	canUserUpgrade: canCurrentUser( state, getSelectedSiteId( state ), 'manage_options' ),
	isSiteWPForTeams: isSiteWPForTeams( state, getSelectedSiteId( state ) ),
} );

export default connect( mapStateToProps, { recordTracksEvent } )( Banner );
