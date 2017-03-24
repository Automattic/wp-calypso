/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { localize } from 'i18n-calypso';
import SearchCard from 'components/search-card';

/**
 * Internal dependencies
 */
import ListTable, { createRenderHelpers } from './list-table';
import columns, { defaultColumnSelections } from './columns';

class ListBody extends React.Component {
	static propTypes = {
		products: PropTypes.array.isRequired,
		categories: PropTypes.array.isRequired,
		edits: PropTypes.object,
		editable: PropTypes.bool.isRequired,
		disabled: PropTypes.bool.isRequired,
		display: PropTypes.object.isRequired,
		setDisplayOption: PropTypes.func.isRequired,
		editProduct: PropTypes.func.isRequired,
		currencySymbol: PropTypes.string.isRequired,
		currencyDecimals: PropTypes.number.isRequired,
		currencyIsPrefix: PropTypes.bool.isRequired,
	}

	constructor( props ) {
		super( props );

		this.onColumnSelectIconClick = this.onColumnSelectIconClick.bind( this );
		this.onColumnSelect = this.onColumnSelect.bind( this );
		this.onEdit = this.onEdit.bind( this );
	}

	onColumnSelectIconClick( evt ) {
		evt.preventDefault();

		const { display, setDisplayOption } = this.props;

		// Toggle the display state of the column select.
		setDisplayOption( 'showColumnPanel', ! display.showColumnPanel );
	}

	onColumnSelect( selection, selected ) {
		const prevKeys = this.getColumnSelections();

		const keys = { ...prevKeys };

		if ( selected ) {
			keys[ selection.key ] = selection;
		} else {
			delete keys[ selection.key ];
		}

		this.props.setDisplayOption( 'columnSelections', keys );
	}

	onEdit( product, key, value ) {
		const { editProduct } = this.props;

		editProduct( product.id, key, value );
	}

	getColumnSelections() {
		return this.props.display.columnSelections || defaultColumnSelections;
	}

	render() {
		const { products, categories, taxClasses, edits, editable, disabled, display } = this.props;
		const { currencySymbol, currencyIsPrefix, currencyDecimals, numberFormat, translate } = this.props;
		const onSearch = () => {}; // TODO: hook up to search/filter action.

		const renderHelpers = createRenderHelpers(
			currencySymbol,
			currencyIsPrefix,
			currencyDecimals,
			numberFormat,
			translate,
			{
				categories,
				taxClasses,
			}
		);

		return (
			<div className="product-list__body">
				<SearchCard onSearch={ onSearch } />
				<ListTable
					products={ products }
					edits={ edits }
					display={ display }
					editable={ editable }
					disabled={ disabled }
					columns={ columns }
					columnSelections={ this.getColumnSelections() }
					onColumnSelectIconClick={ this.onColumnSelectIconClick }
					onColumnSelect={ this.onColumnSelect }
					onEdit={ this.onEdit }
					renderHelpers={ renderHelpers }
				/>
			</div>
		);
	}
}

export default localize( ListBody );

