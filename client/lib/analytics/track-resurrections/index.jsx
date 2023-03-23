import { useEffect } from '@wordpress/element';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import getUserSetting from 'calypso/state/selectors/get-user-setting';

const TrackResurrections = ( { login_time, yearInterval, isFetchingUserSettings } ) => {
	const isResurrected = ( loginTime, previousLoginTime ) => {
		const differenceInMilliseconds = loginTime - previousLoginTime;
		const differenceInYears = differenceInMilliseconds / ( 1000 * 60 * 60 * 24 * 365 );

		return differenceInYears > yearInterval;
	};

	useEffect( () => {
		if ( isFetchingUserSettings ) {
			return null;
		}

		const { login_time: loginTimeArr, previous_login_time: previousLoginTimeArr } = login_time;

		// Used `Math.max` function to get maximum values of `login_time` and `previous_login_time` arrays
		const loginTime = loginTimeArr.length ? Math.max( ...loginTimeArr ) : Date.now();
		const previousLoginTime = previousLoginTimeArr.length
			? Math.max( ...previousLoginTimeArr )
			: loginTime;

		if ( ! isResurrected( loginTime, previousLoginTime, yearInterval ) ) {
			return;
		}

		// Only fire event if the difference between resurrection login time and current time is less 5 minutes.
		const differenceInDays = ( Date.now() - loginTime ) / ( 1000 * 60 * 5 );

		if ( differenceInDays <= 1 ) {
			recordTracksEvent( 'calypso_user_resurrected', {
				loginTime,
				previousLoginTime,
			} );
		}
	}, [] ); // We want this to only fire once.

	return null;
};

TrackResurrections.propTypes = {
	yearInterval: PropTypes.number,
	login_time: PropTypes.shape( {
		login_time: PropTypes.arrayOf( PropTypes.number ),
		previous_login_time: PropTypes.arrayOf( PropTypes.number ),
	} ),
};

TrackResurrections.defaultProps = {
	yearInterval: 1,
	login_time: { login_time: [], previous_login_time: [] },
};

const mapStateToProps = ( state ) => {
	const login_time = getUserSetting( state, 'login_time' );

	return {
		login_time,
		isFetchingUserSettings: state.userSettings.fetching,
	};
};

export default connect( mapStateToProps )( TrackResurrections );
