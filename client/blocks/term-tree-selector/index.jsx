/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import TermTreeSelectorTerms from './terms';
import TermSelectorAddTerm from './add-term';

export default class TermTreeSelector extends React.Component {
	static propTypes = {
		multiple: PropTypes.bool,
		className: PropTypes.string,
		onChange: PropTypes.func.isRequired,
		selected: PropTypes.array,
		createLink: PropTypes.string,
		analyticsPrefix: PropTypes.string,
		taxonomy: PropTypes.string,
		height: PropTypes.number,
		compact: PropTypes.bool,
		addTerm: PropTypes.bool,
		postType: PropTypes.string,
		onAddTermSuccess: PropTypes.func,
		podcastingCategoryId: PropTypes.number,
	};

	static defaultProps = {
		analyticsPrefix: 'Category Selector',
		selected: [],
		taxonomy: 'category',
		onChange: () => {},
		height: 300,
		addTerm: false,
		postType: 'post',
		onAddTermSuccess: () => {},
	};

	state = {
		search: '',
	};

	onSearch = ( searchTerm ) => {
		if ( searchTerm !== this.state.search ) {
			this.setState( {
				search: searchTerm,
			} );
		}
	};

	UNSAFE_componentWillReceiveProps( nextProps ) {
		if ( nextProps.taxonomy !== this.props.taxonomy ) {
			this.setState( { search: '' } );
		}
	}

	render() {
		const {
			taxonomy,
			onChange,
			selected,
			createLink,
			multiple,
			height,
			compact,
			addTerm,
			postType,
			onAddTermSuccess,
			podcastingCategoryId,
		} = this.props;

		const { search } = this.state;
		const query = {};
		if ( search && search.length ) {
			query.search = search;
		}

		return (
			<div>
				<TermTreeSelectorTerms
					taxonomy={ taxonomy }
					onSearch={ this.onSearch }
					onChange={ onChange }
					query={ query }
					selected={ selected }
					createLink={ createLink }
					multiple={ multiple }
					height={ height }
					compact={ compact }
					podcastingCategoryId={ podcastingCategoryId }
				/>
				{ addTerm && (
					<TermSelectorAddTerm
						taxonomy={ taxonomy }
						postType={ postType }
						onSuccess={ onAddTermSuccess }
					/>
				) }
			</div>
		);
	}
}
