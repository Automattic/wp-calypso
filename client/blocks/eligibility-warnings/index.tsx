/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import i18n, { localize, LocalizeProps } from 'i18n-calypso';
const hasTranslation = ( message: string ) => i18n.hasTranslation( message );
import { includes, noop } from 'lodash';
import classNames from 'classnames';
import Gridicon from 'components/gridicon';
import page from 'page';

/**
 * Internal dependencies
 */
import { FEATURE_UPLOAD_PLUGINS, FEATURE_UPLOAD_THEMES, FEATURE_SFTP } from 'lib/plans/constants';
import TrackComponentView from 'lib/analytics/track-component-view';
import { recordTracksEvent } from 'state/analytics/actions';
import { getEligibility, isEligibleForAutomatedTransfer } from 'state/automated-transfer/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import { Button, CompactCard } from '@automattic/components';
import QueryEligibility from 'components/data/query-atat-eligibility';
import HoldList, { hasBlockingHold } from './hold-list';
import WarningList from './warning-list';

/**
 * Style dependencies
 */
import './style.scss';

interface ExternalProps {
	backUrl: string;
	onProceed: () => void;
}

type Props = ExternalProps & ReturnType< typeof mergeProps > & LocalizeProps;

export const EligibilityWarnings = ( {
	context,
	feature,
	eligibilityData,
	isEligible,
	isPlaceholder,
	onProceed,
	recordCtaClick,
	siteId,
	siteSlug,
	translate,
}: Props ) => {
	const warnings = eligibilityData.eligibilityWarnings || [];
	const listHolds = eligibilityData.eligibilityHolds || [];

	const showWarnings = warnings.length > 0 && ! hasBlockingHold( listHolds );
	const classes = classNames( 'eligibility-warnings', {
		'eligibility-warnings__placeholder': isPlaceholder,
		'eligibility-warnings--with-indent': showWarnings,
	} );

	const logEventAndProceed = () => {
		recordCtaClick( feature );
		if ( siteRequiresUpgrade( listHolds ) ) {
			page.redirect( `/checkout/${ siteSlug }/business` );
			return;
		}
		onProceed();
	};

	const showThisSiteIsEligibleMessage =
		isEligible && 0 === listHolds.length && 0 === warnings.length;

	return (
		<div className={ classes }>
			<QueryEligibility siteId={ siteId } />
			<TrackComponentView
				eventName="calypso_automated_transfer_eligibility_show_warnings"
				eventProperties={ { context } }
			/>

			{ ( isPlaceholder || listHolds.length > 0 ) && (
				<CompactCard>
					<HoldList context={ context } holds={ listHolds } isPlaceholder={ isPlaceholder } />
				</CompactCard>
			) }

			{ showThisSiteIsEligibleMessage && (
				<CompactCard>
					<div className="eligibility-warnings__no-conflicts">
						<Gridicon icon="thumbs-up" size={ 24 } />
						<span>{ getSiteIsEligibleMessage( context, translate ) }</span>
					</div>
				</CompactCard>
			) }

			{ showWarnings && (
				<CompactCard className="eligibility-warnings__warnings-card">
					<WarningList context={ context } warnings={ warnings } />
				</CompactCard>
			) }
			<CompactCard>
				<div className="eligibility-warnings__confirm-buttons">
					<Button
						primary={ true }
						disabled={ isProceedButtonDisabled( isEligible, listHolds ) }
						onClick={ logEventAndProceed }
					>
						{ getProceedButtonText( listHolds, translate ) }
					</Button>
				</div>
			</CompactCard>
		</div>
	);
};

function getSiteIsEligibleMessage(
	context: string | null,
	translate: LocalizeProps[ 'translate' ]
) {
	const defaultCopy = translate( 'This site is eligible to install plugins and upload themes.' );
	switch ( context ) {
		case 'plugins':
		case 'themes':
			return hasTranslation( 'This site is eligible to install plugins and upload themes.' )
				? translate( 'This site is eligible to install plugins and upload themes.' )
				: defaultCopy;
		case 'hosting':
			return hasTranslation( 'This site is eligible to activate hosting access.' )
				? translate( 'This site is eligible to activate hosting access.' )
				: defaultCopy;
		default:
			return hasTranslation( 'This site is eligible to continue.' )
				? translate( 'This site is eligible to continue.' )
				: defaultCopy;
	}
}

function getProceedButtonText( holds: string[], translate: LocalizeProps[ 'translate' ] ) {
	const defaultCopy = translate( 'Proceed' );
	if ( holds.includes( 'NO_BUSINESS_PLAN' ) ) {
		return hasTranslation( 'Upgrade and continue' )
			? translate( 'Upgrade and continue' )
			: defaultCopy;
	}

	return hasTranslation( 'Continue' ) ? translate( 'Continue' ) : defaultCopy;
}

function isProceedButtonDisabled( isEligible: boolean, holds: string[] ) {
	const canHandleHoldsAutomatically =
		holds.length <= 2 && holds.every( hold => [ 'NO_BUSINESS_PLAN' ].includes( hold ) );

	return ! canHandleHoldsAutomatically && ! isEligible;
}

function siteRequiresUpgrade( holds: string[] ) {
	return holds.includes( 'NO_BUSINESS_PLAN' );
}

EligibilityWarnings.defaultProps = {
	onProceed: noop,
};

const mapStateToProps = ( state: object ) => {
	const siteId = getSelectedSiteId( state );
	const siteSlug = getSelectedSiteSlug( state );
	const eligibilityData = getEligibility( state, siteId );
	const isEligible = isEligibleForAutomatedTransfer( state, siteId );
	const dataLoaded = !! eligibilityData.lastUpdate;

	return {
		eligibilityData,
		isEligible,
		isPlaceholder: ! dataLoaded,
		siteId,
		siteSlug,
	};
};

const mapDispatchToProps = {
	trackProceed: ( eventProperties = {} ) =>
		recordTracksEvent( 'calypso_automated_transfer_eligibilty_click_proceed', eventProperties ),
	recordCtaClick: ( feature: string ) =>
		recordTracksEvent( 'calypso_banner_cta_click', {
			cta_name: 'calypso-theme-eligibility-upgrade-nudge',
			cta_feature: feature,
			cta_size: 'regular',
		} ),
};

function mergeProps(
	stateProps: ReturnType< typeof mapStateToProps >,
	dispatchProps: typeof mapDispatchToProps,
	ownProps: ExternalProps
) {
	let context: string | null = null;
	let feature = '';
	if ( includes( ownProps.backUrl, 'plugins' ) ) {
		context = 'plugins';
		feature = FEATURE_UPLOAD_PLUGINS;
	} else if ( includes( ownProps.backUrl, 'themes' ) ) {
		context = 'themes';
		feature = FEATURE_UPLOAD_THEMES;
	} else if ( includes( ownProps.backUrl, 'hosting' ) ) {
		context = 'hosting';
		feature = FEATURE_SFTP;
	}

	const onProceed = () => {
		ownProps.onProceed();
		dispatchProps.trackProceed( { context } );
	};

	return {
		...ownProps,
		...stateProps,
		...dispatchProps,
		onProceed,
		context,
		feature,
	};
}

export default connect(
	mapStateToProps,
	mapDispatchToProps,
	mergeProps
)( localize( EligibilityWarnings ) );
