/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import PureRenderMixin from 'react-pure-render/mixin';
import mapKeys from 'lodash/object/mapKeys';
import snakeCase from 'lodash/string/snakeCase';

/**
 * Internal dependencies
 */
import PostSelectorPagination from './pagination';

export default React.createClass( {
	displayName: 'PostSelector',

	mixins: [ PureRenderMixin ],

	propTypes: {
		type: PropTypes.string,
		siteId: PropTypes.number.isRequired,
		status: PropTypes.string,
		multiple: PropTypes.bool,
		onChange: PropTypes.func,
		selected: PropTypes.number,
		excludeTree: PropTypes.number,
		emptyMessage: PropTypes.string,
		createLink: PropTypes.string,
		orderBy: PropTypes.oneOf( [ 'title', 'date', 'modified', 'comment_count', 'ID' ] ),
		order: PropTypes.oneOf( [ 'ASC', 'DESC' ] )
	},

	getDefaultProps() {
		return {
			type: 'post',
			status: 'publish,private',
			multiple: false,
			orderBy: 'title',
			order: 'ASC'
		};
	},

	getInitialState() {
		return {
			page: 1,
			search: ''
		};
	},

	onSearch( term ) {
		if ( term !== this.state.search ) {
			this.setState( {
				page: 1,
				search: term
			} );
		}
	},

	getQuery() {
		const { type, status, excludeTree, orderBy, order } = this.props;
		const { page, search } = this.state;
		return mapKeys( { type, status, excludeTree, orderBy, order, page, search }, ( value, key ) => {
			return snakeCase( key );
		} );
	},

	incrementPage() {
		this.setState( {
			page: this.state.page + 1
		} );
	},

	render() {
		const { siteId, multiple, onChange, emptyMessage, createLink, selected } = this.props;

		return (
			<PostSelectorPagination
				siteId={ siteId }
				query={ this.getQuery() }
				onNextPage={ this.incrementPage }
				onSearch={ this.onSearch }
				multiple={ multiple }
				onChange={ onChange }
				emptyMessage={ emptyMessage }
				createLink={ createLink }
				selected={ selected }
			/>
		);
	}
} );
