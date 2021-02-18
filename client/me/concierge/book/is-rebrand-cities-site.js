/**
 * We have an initiative partnership called Rebrand Cities, where our partners help businesses
 * set up a WordPress.com Business site. The site owners are then encouraged to book a Concierge
 * Session to start chatting directly with our Happiness Engineers. We'd like to flag these sessions
 * as part of the Rebrand Cities program so that the HE has more context and can give the customer
 * a session tailored to the program.
 *
 * The best way to auto-identify a site as belonging to the Rebrand Cities program is by checking
 * if the main Rebrand Cities WordPress.com account is a member of the site — this account is used
 * to set up all of these sites.
 *
 * This component's purpose is to check the passed-in siteId and notify using the onChange prop
 * whether the site is a part of the program. This information can then be passed on to the booking
 * API call and used to customize the invitation and inform the HE that this is a Rebrand Cities session.
 */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import SiteUsersFetcher from 'calypso/components/site-users-fetcher';

const REBRAND_CITIES_ACCOUNT_USERNAME = 'rebrandcities';

/**
 * The <AreUsersPresent /> component takes a set of users and an onChange callback. It
 * passes true or false into the callback whenever the count of users changes. This is
 * intended to be wrapped in a SiteUsersFetcher which will pass the users in.
 *
 * This is a helper component which isn't exported.
 */
class AreUsersPresent extends Component {
	static propTypes = {
		// onChange is passed in from the primary component
		onChange: PropTypes.func.isRequired,
		// users is passed from the SiteUsersFetcher
		users: PropTypes.array,
	};

	static defaultProps = {
		users: [],
	};

	notifyValue() {
		this.props.onChange( this.props.users.length > 0 );
	}

	componentDidMount() {
		this.notifyValue();
	}

	componentDidUpdate( prevProps ) {
		if ( prevProps.users.length !== this.props.users.length ) {
			this.notifyValue();
		}
	}

	render() {
		return null;
	}
}

/**
 * The <IsRebrandCitiesSite /> component takes a siteId and an onChange callback. The
 * callback is executed with true or false depending on if the passed-in site ID is owned
 * by the Rebrand Cities account. This information can then be passed on when the concierge
 * session is booked by the implementing component.
 */
class IsRebrandCitiesSite extends Component {
	static propTypes = {
		onChange: PropTypes.func.isRequired,
		siteId: PropTypes.number.isRequired,
	};

	render() {
		const { onChange, siteId } = this.props;

		const siteUsersFetchOptions = {
			siteId,
			// By setting a search without * wildcards, we can ensure that only users
			// on the site with an exactly-matching username will be passed through,
			search: REBRAND_CITIES_ACCOUNT_USERNAME,
			search_columns: [ 'display_name', 'user_login' ],
		};

		return (
			<SiteUsersFetcher fetchOptions={ siteUsersFetchOptions }>
				<AreUsersPresent onChange={ onChange } />
			</SiteUsersFetcher>
		);
	}
}

export default IsRebrandCitiesSite;
