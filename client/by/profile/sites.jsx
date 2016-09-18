/**
 * External dependencies
 */
import { connect } from 'react-redux';
import React, { PropTypes } from 'react';

const ProfileSites = ( { sites } ) => (
	<div className="profile__sites">
		{ sites.map( ( { id } ) => (
			<div key={ `site-${ id }` }>
				<h3>Site { id }</h3>
			</div>
		) ) }
	</div>
);

ProfileSites.propTypes = {
	sites: PropTypes.array.isRequired,
	username: PropTypes.string.isRequired
};

const mapStateToProps = () => ( {
	sites: [ { id: 1 }, { id: 2 }, { id: 3 } ]
} );

export default connect( mapStateToProps )( ProfileSites );
