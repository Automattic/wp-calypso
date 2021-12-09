import classnames from 'classnames';
import PropTypes from 'prop-types';
import { Component } from 'react';
import SelectDropdown from 'calypso/components/select-dropdown';

class DomainsTableFilterButton extends Component {
	static propTypes = {
		selectedFilter: PropTypes.string,
		filterOptions: PropTypes.arrayOf(
			PropTypes.shape( {
				label: PropTypes.string.isRequired,
				value: PropTypes.string.isRequired,
				path: PropTypes.string,
				count: PropTypes.number,
			} )
		),
		compact: PropTypes.bool.isRequired,
		isLoading: PropTypes.bool,
		disabled: PropTypes.bool,
	};

	getFilterOptions() {
		return this.props.filterOptions;
	}

	getFilterItems() {
		const { selectedFilter } = this.props;

		return this.getFilterOptions().map( ( item, index ) => {
			if ( ! item ) {
				return <SelectDropdown.Separator key={ `key-separator-${ index }` } />;
			}

			return (
				<SelectDropdown.Item
					key={ `key-${ item.value }` }
					selected={ item.value === selectedFilter }
					value={ item.value }
					path={ item.path }
					count={ item.count }
				>
					{ item.label }
				</SelectDropdown.Item>
			);
		} );
	}

	getSelectedItem() {
		const { selectedFilter } = this.props;
		return this.getFilterOptions().find( ( item ) => item && item.value === selectedFilter );
	}

	getSelectedText() {
		return this.getSelectedItem().label;
	}

	getSelectedCount() {
		return this.getSelectedItem().count;
	}

	render() {
		const { isLoading, disabled, compact } = this.props;
		return (
			<SelectDropdown
				className={ classnames( 'domains-table-filter-button', {
					'is-mobile-version': ! compact,
				} ) }
				compact={ compact }
				initialSelected="site-domains"
				selectedText={ this.getSelectedText() }
				selectedCount={ this.getSelectedCount() }
				isLoading={ isLoading }
				disabled={ disabled }
			>
				{ this.getFilterItems() }
			</SelectDropdown>
		);
	}
}

export default DomainsTableFilterButton;
