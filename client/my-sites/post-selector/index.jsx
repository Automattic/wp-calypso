/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import omit from 'lodash/object/omit';
import noop from 'lodash/utility/noop';

/**
 * Internal dependencies
 */
import Selector from './selector';
import PostListFetcher from 'components/post-list-fetcher';

export default React.createClass( {
	displayName: 'PostSelector',

	mixins: [ React.addons.PureRenderMixin ],

	propTypes: {
		type: PropTypes.string,
		siteId: PropTypes.number.isRequired,
		status: PropTypes.string,
		multiple: PropTypes.bool,
		onChange: PropTypes.func,
		selected: PropTypes.number,
		excludeTree: PropTypes.number,
		orderBy: PropTypes.oneOf( [ 'title', 'date', 'modified', 'comment_count', 'ID' ] ),
		order: PropTypes.oneOf( [ 'ASC', 'DESC' ] )
	},

	getDefaultProps() {
		return {
			type: 'post',
			status: 'publish,private',
			multiple: false,
			onChange: noop,
			orderBy: 'title',
			order: 'ASC'
		};
	},

	getInitialState() {
		return {
			searchTerm: null
		};
	},

	onSearch( term ) {
		if ( term !== this.state.searchTerm ) {
			this.setState( { searchTerm: term } );
		}
	},

	render() {
		return (
			<PostListFetcher
				type={ this.props.type }
				siteID={ this.props.siteId }
				search={ this.state.searchTerm }
				status={ this.props.status }
				excludeTree={ this.props.excludeTree }
				orderBy={ this.props.orderBy }
				order={ this.props.order }
			>
				<Selector
					{ ...omit( this.props, 'children' ) }
					onSearch={ this.onSearch }
				/>
			</PostListFetcher>
		);
	}
} );
