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
	backUrl,
	context,
	eligibilityData,
	isEligible,
	isPlaceholder,
	onProceed,
	onCancel,
	siteId,
	translate,
}: Props ) => {
	const warnings = eligibilityData.eligibilityWarnings || [];
	const listHolds = eligibilityData.eligibilityHolds || [];

	const classes = classNames( 'eligibility-warnings', {
		'eligibility-warnings__placeholder': isPlaceholder,
	} );

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

				<div className="eligibility-warnings__confirm-box">
					<div className="eligibility-warnings__confirm-text">
						{ ! isEligible && (
							<>
								{ translate( 'Please clear all issues above to proceed.' ) }
								&nbsp;
							</>
						) }
						{ isEligible && warnings.length > 0 && (
							<>
								{ translate( 'If you proceed you will no longer be able to use these features. ' ) }
								&nbsp;
							</>
						) }
						{ translate( 'Questions? {{a}}Contact support{{/a}} for help.', {
							components: {
								a: (
									<a
										href="https://wordpress.com/help/contact"
										target="_blank"
										rel="noopener noreferrer"
									/>
								),
							},
						} ) }
					</div>
					<div className="eligibility-warnings__confirm-buttons">
						<Button href={ backUrl } onClick={ onCancel }>
							{ translate( 'Cancel' ) }
						</Button>

						<Button primary={ true } disabled={ ! isEligible } onClick={ onProceed }>
							{ translate( 'Proceed' ) }
						</Button>
					</div>
				</div>
			</Card>
		</div>
	);
};

EligibilityWarnings.defaultProps = {
	onProceed: noop,
};

const mapStateToProps = ( state: object ) => {
	const siteId = getSelectedSiteId( state );
	const eligibilityData = getEligibility( state, siteId );
	const isEligible = isEligibleForAutomatedTransfer( state, siteId );
	const dataLoaded = !! eligibilityData.lastUpdate;

	return {
		eligibilityData,
		isEligible,
		isPlaceholder: ! dataLoaded,
		siteId,
	};
};

const mapDispatchToProps = {
	trackCancel: ( eventProperties = {} ) =>
		recordTracksEvent( 'calypso_automated_transfer_eligibility_click_cancel', eventProperties ),
	trackProceed: ( eventProperties = {} ) =>
		recordTracksEvent( 'calypso_automated_transfer_eligibilty_click_proceed', eventProperties ),
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

	const onCancel = () => {
		dispatchProps.trackCancel( { context } );
	};
	const onProceed = () => {
		ownProps.onProceed();
		dispatchProps.trackProceed( { context } );
	};

	return {
		...ownProps,
		...stateProps,
		...dispatchProps,
		onCancel,
		onProceed,
		context,
	};
}

export default connect(
	mapStateToProps,
	mapDispatchToProps,
	mergeProps
)( localize( EligibilityWarnings ) );
