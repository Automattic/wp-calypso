import { isEnabled } from '@automattic/calypso-config';
import { FEATURE_STATS_PAID } from '@automattic/calypso-products';
import { StatsCard } from '@automattic/components';
import { connect } from 'react-redux';
import { useSelector } from 'calypso/state';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

const trafficPaidStats = [
	'statsSearchTerms',
	'statsClicks',
	'statsReferrers',
	'statsCountryViews',
];

const featureFlags = [ 'stats/date-control' ];

export const useFeatureGating = ( featureType ) => {
	const isPaidStatsEnabled = isEnabled( 'stats/paid-wpcom-v2' );
	const siteId = useSelector( getSelectedSiteId );
	const siteHasPaidStats = useSelector( ( state ) =>
		siteHasFeature( state, siteId, FEATURE_STATS_PAID )
	);
	const canAccessFeature = isPaidStatsEnabled
		? siteHasPaidStats && [ ...trafficPaidStats, ...featureFlags ].includes( featureType )
		: true;
	return { canAccessFeature };
};

const withFeatureGating = ( WrappedComponent, dataOnly, FallbackComponent ) => {
	const WithFeatureGating = ( props ) => {
		const { statType, gridArea } = props;

		const { canAccessFeature } = useFeatureGating( statType );

		if ( ! dataOnly && ! canAccessFeature ) {
			return FallbackComponent ? (
				<FallbackComponent { ...props } />
			) : (
				// Temp demo component
				<div style={ { gridArea: gridArea } }>
					<StatsCard title={ `Feature ${ gridArea } not available` } isEmpty />
				</div>
			);
		}

		return <WrappedComponent canAccessFeature={ canAccessFeature } { ...props } />;
	};

	const mapStateToProps = ( state, ownProps ) => {
		return {
			statType: ownProps.statType,
			gridArea: ownProps.gridArea,
		};
	};

	return connect( mapStateToProps )( WithFeatureGating );
};

export default withFeatureGating;
