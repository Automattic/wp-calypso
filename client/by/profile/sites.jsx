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
import FollowButtonContainer from 'components/follow-button';

const ProfileSites = ( { loading, sites } ) => {
	if ( loading ) {
		return <div className="profile__loading">Loading</div>;
	}

	return (
		<div className="profile__sites">
			{ sites.map( site => (
				<div className="profile__site-card card" key={ `site-${ site.ID }` }>
					<header className="profile__site-card-header">
						<div className="profile__site-title">
							<span className="profile__site-type">I created</span>
							<h3><a href=" { site.Url } ">{ site.title }</a></h3>
						</div>

						<div className="profile__site-actions">
							<a href="#" className="profile__remove-element">x</a>
							<FollowButtonContainer siteUrl="{ site.Url }" />
						</div>
					</header>
					<div className="profile__site-header"></div>
					<SiteIcon site={ site } />
					<p>{ site.description }</p>
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
