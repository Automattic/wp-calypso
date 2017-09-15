/**
 * External dependencies
 */
import PropTypes from 'prop-types';

import React from 'react';
import PureRenderMixin from 'react-pure-render/mixin';
import { reduce, snakeCase } from 'lodash';

/**
 * Internal dependencies
 */
import PostSelectorPosts from './selector';

export default React.createClass( {
	displayName: 'PostSelector',

	mixins: [ PureRenderMixin ],

	propTypes: {
		type: PropTypes.string,
		excludePrivateTypes: PropTypes.bool,
		siteId: PropTypes.number.isRequired,
		status: PropTypes.string,
		multiple: PropTypes.bool,
		onChange: PropTypes.func,
		selected: PropTypes.number,
		excludeTree: PropTypes.number,
		emptyMessage: PropTypes.string,
		createLink: PropTypes.string,
		orderBy: PropTypes.oneOf( [ 'title', 'date', 'modified', 'comment_count', 'ID' ] ),
		order: PropTypes.oneOf( [ 'ASC', 'DESC' ] ),
		showTypeLabels: PropTypes.bool,
		suppressFirstPageLoad: PropTypes.bool,
	},

	getDefaultProps() {
		return {
			type: 'post',
			status: 'publish,private',
			multiple: false,
			orderBy: 'title',
			order: 'ASC',
			suppressFirstPageLoad: false,
		};
	},

	getInitialState() {
		return {
			search: ''
		};
	},

	onSearch( term ) {
		if ( term !== this.state.search ) {
			this.setState( {
				search: term
			} );
		}
	},

	getQuery() {
		const { type, status, excludeTree, orderBy, order, excludePrivateTypes } = this.props;
		const { search } = this.state;

		return reduce( { type, status, excludeTree, orderBy, order, excludePrivateTypes, search }, ( memo, value, key ) => {
			if ( null === value || undefined === value ) {
				return memo;
			}

			// if we don't have a search term, default to ordering by date
			if ( key === 'orderBy' && search !== '' ) {
				value = 'date';
			}

			if ( key === 'order' && search !== '' ) {
				value = 'DESC';
			}

			memo[ snakeCase( key ) ] = value;
			return memo;
		}, {} );
	},

	render() {
		const { siteId, multiple, onChange, emptyMessage, createLink, selected, showTypeLabels, suppressFirstPageLoad } = this.props;

		return (
			<PostSelectorPosts
				siteId={ siteId }
				query={ this.getQuery() }
				onSearch={ this.onSearch }
				multiple={ multiple }
				onChange={ onChange }
				emptyMessage={ emptyMessage }
				createLink={ createLink }
				selected={ selected }
				showTypeLabels={ showTypeLabels }
				suppressFirstPageLoad={ suppressFirstPageLoad }
			/>
		);
	}
} );
