/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
//import getSiteRecommendedPlugins from 'state/selectors/get-site-recommended-plugins';
//import { listSiteRecommendedPlugins } from 'state/sites/site-recommended-plugins/actions';

class QuerySiteRecommendedPlugins extends Component {
	static propTypes = {
		blogId: PropTypes.number.isRequired,
		isLoaded: PropTypes.bool.isRequired,
	};

	componentDidMount() {
		if ( ! this.props.isLoaded ) {
			//this.props.listSiteRecommendedPlugins( this.props.blogId );
		}
	}

	componentDidUpdate( prevProps ) {
		if ( prevProps.blogId !== this.props.blogId && ! this.props.isLoaded ) {
			//this.props.listSiteRecommendedPlugins( this.props.blogId );
		}
	}

	render() {
		return null;
	}
}

export default connect(
	( state, { blogId } ) => ( {
		//isLoaded: !! getSiteRecommendedPlugins( state, blogId ),
	} ),
	{
		/*listSiteRecommendedPlugins */
	}
)( QuerySiteRecommendedPlugins );
