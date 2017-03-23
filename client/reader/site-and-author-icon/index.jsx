/**
 * External Dependencies
 */
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal Dependencies
 */
import SiteIcon from 'blocks/site-icon';
import Gravatar from 'components/gravatar';
import { getSite } from 'state/reader/sites/selectors';
import QueryReaderSite from 'components/data/query-reader-site';

class SiteAndAuthorIcon extends React.Component {

	static propTypes = {
		siteId: React.PropTypes.number.isRequired,
		isExternal: React.PropTypes.bool.isRequired,
		user: React.PropTypes.object.isRequired
	}

	render() {
		const site = this.props.site || {};
		return (
			<div className="reader__site-and-author-icon">
				<SiteIcon site={ site } />
				<Gravatar user={ this.props.user } size={ 24 } />
				{ this.props.site && ! this.props.isExternal &&
					<QueryReaderSite siteId={ this.props.siteId } />
				}
			</div>
		);
	}
}

export default connect(
	( state, ownProps ) => ( {
		site: getSite( state, ownProps.siteId )
	} )
)( SiteAndAuthorIcon );
