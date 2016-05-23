// External dependencies
import React from 'react';
import { connect } from 'react-redux';

// Internal dependencies
import SiteIcon from 'components/site-icon';
import { getSite } from 'state/reader/sites/selectors';

const StartCardHeader = ( { site } ) => {
	return (
		<header>
			<SiteIcon site={ site } size={ 70 } />
			<h1 className="reader-start-card__site-title">{ site.title }</h1>
			<p className="reader-start-card__site-description">{ site.description }</p>
		</header>
	);
};

StartCardHeader.propTypes = {
	siteId: React.PropTypes.number.isRequired
};

export default connect(
	( state, ownProps ) => {
		return {
			site: getSite( state, ownProps.siteId )
		};
	}
)( StartCardHeader );
