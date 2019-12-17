/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize, LocalizeProps } from 'i18n-calypso';
import { includes, noop } from 'lodash';
import classNames from 'classnames';
import Gridicon from 'components/gridicon';

/**
 * Internal dependencies
 */
import TrackComponentView from 'lib/analytics/track-component-view';
import { recordTracksEvent } from 'state/analytics/actions';
import { getEligibility, isEligibleForAutomatedTransfer } from 'state/automated-transfer/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import isUnlaunchedSite from 'state/selectors/is-unlaunched-site';
import { launchSite as launchSiteActionCreator } from 'state/sites/launch/actions';
import { saveSiteSettings as saveSiteSettingsActionCreator } from 'state/site-settings/actions';
import { Button, Card } from '@automattic/components';
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
	eligibilityData,
	isEligible,
	isPlaceholder,
	isUnlaunched,
	launchSite,
	onProceed,
	saveSiteSettings,
	siteId,
	translate,
}: Props ) => {
	const warnings = eligibilityData.eligibilityWarnings || [];
	const listHolds = eligibilityData.eligibilityHolds || [];

	const classes = classNames( 'eligibility-warnings', {
		'eligibility-warnings__placeholder': isPlaceholder,
	} );

	const handleContinueClick = async () => {
		if ( isUnlaunched ) {
			if ( ! ( await launchSite( siteId ) ) ) {
				return;
			}
		} else if ( listHolds.includes( 'SITE_PRIVATE' ) ) {
			const response = await saveSiteSettings( siteId, { blog_public: 0 } );
			if ( response?.updated?.blog_public !== '0' ) {
				return;
			}
		}

		onProceed();
	};

	return (
		<div className={ classes }>
			<QueryEligibility siteId={ siteId } />
			<TrackComponentView
				eventName="calypso_automated_transfer_eligibility_show_warnings"
				eventProperties={ { context } }
			/>
			{ warnings.length > 0 && ! hasBlockingHold( listHolds ) && (
				<WarningList warnings={ warnings } />
			) }

			<Card>
				{ ( isPlaceholder || listHolds.length > 0 ) && (
					<HoldList context={ context } holds={ listHolds } isPlaceholder={ isPlaceholder } />
				) }

				{ isEligible && 0 === listHolds.length && 0 === warnings.length && (
					<div className="eligibility-warnings__no-conflicts">
						<Gridicon icon="thumbs-up" size={ 24 } />
						<span>
							{ translate( 'This site is eligible to install plugins and upload themes.' ) }
						</span>
					</div>
				) }

				<div className="eligibility-warnings__confirm-buttons">
					<Button
						primary={ true }
						disabled={ isProceedButtonDisabled( isEligible, listHolds ) }
						onClick={ handleContinueClick }
					>
						{ getProceedButtonText( listHolds, translate ) }
					</Button>
				</div>
			</Card>
		</div>
	);
};

function getProceedButtonText( holds: string[], translate: LocalizeProps[ 'translate' ] ) {
	if ( holds.includes( 'NO_BUSINESS_PLAN' ) ) {
		return translate( 'Upgrade and continue' );
	}

	return translate( 'Continue' );
}

function isProceedButtonDisabled( isEligible: boolean, holds: string[] ) {
	const canHandleHoldsAutomatically =
		holds.length <= 2 &&
		holds.every( hold => [ 'NO_BUSINESS_PLAN', 'SITE_PRIVATE' ].includes( hold ) );

	return ! canHandleHoldsAutomatically && ! isEligible;
}

EligibilityWarnings.defaultProps = {
	onProceed: noop,
};

const mapStateToProps = ( state: object ) => {
	const siteId = getSelectedSiteId( state );
	const eligibilityData = getEligibility( state, siteId );
	const isEligible = isEligibleForAutomatedTransfer( state, siteId );
	const isUnlaunched = siteId !== null && isUnlaunchedSite( state, siteId );
	const dataLoaded = !! eligibilityData.lastUpdate;

	return {
		eligibilityData,
		isEligible,
		isPlaceholder: ! dataLoaded,
		isUnlaunched,
		siteId,
	};
};

const mapDispatchToProps = {
	trackProceed: ( eventProperties = {} ) =>
		recordTracksEvent( 'calypso_automated_transfer_eligibilty_click_proceed', eventProperties ),
	launchSite: launchSiteActionCreator,
	saveSiteSettings: saveSiteSettingsActionCreator,
};

function mergeProps(
	stateProps: ReturnType< typeof mapStateToProps >,
	dispatchProps: typeof mapDispatchToProps,
	ownProps: ExternalProps
) {
	let context: string | null = null;
	if ( includes( ownProps.backUrl, 'plugins' ) ) {
		context = 'plugins';
	} else if ( includes( ownProps.backUrl, 'themes' ) ) {
		context = 'themes';
	} else if ( includes( ownProps.backUrl, 'hosting' ) ) {
		context = 'hosting';
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
	};
}

export default connect(
	mapStateToProps,
	mapDispatchToProps,
	mergeProps
)( localize( EligibilityWarnings ) );
