/**
 * External dependencies
 */
import { connect } from 'react-redux';
import React, { PropTypes } from 'react';

/**
 * Internal dependencies
 */
import { getSites, isRequestingSites } from 'state/sites/selectors';
import SiteIcon from 'components/site-icon';

const ProfileSites = ( { loading, sites } ) => {
	if ( loading ) {
		return <div>Loading</div>;
	}

	return (
		<div className="profile__sites">
			{ sites.map( site => (
				<div key={ `site-${ site.ID }` }>
					<h3>{ site.title }</h3>
					<p>{ site.description }</p>
					<SiteIcon site={ site } />
				</div>
			) ) }
		</div>
	);
};

ProfileSites.propTypes = {
	sites: PropTypes.array.isRequired
};

const mapStateToProps = state => ( {
	loading: isRequestingSites( state ),
	sites: getSites( state )
} );

export default connect( mapStateToProps )( ProfileSites );
