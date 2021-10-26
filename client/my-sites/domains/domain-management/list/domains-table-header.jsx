import { Button, CompactCard } from '@automattic/components';
import { Icon, arrowDown, arrowUp } from '@wordpress/icons';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import FormCheckbox from 'calypso/components/forms/form-checkbox';
import MaterialIcon from 'calypso/components/material-icon';
import SelectDropdown from 'calypso/components/select-dropdown';
import { ListAllActions } from 'calypso/my-sites/domains/domain-management/list/utils';
import './style.scss';

class DomainsTableHeader extends PureComponent {
	static propTypes = {
		action: PropTypes.string,
		columns: PropTypes.array,
		headerClasses: PropTypes.object,
		isChecked: PropTypes.bool,
		disabled: PropTypes.bool,
		isBusy: PropTypes.bool,
		onToggle: PropTypes.func,
		isManagingAllSites: PropTypes.bool,
		onChangeSortOrder: PropTypes.func,
		activeSortKey: PropTypes.string,
		activeSortOrder: PropTypes.number,
	};

	static defaultProps = {
		disabled: false,
		onToggle: null,
		isBusy: false,
		isChecked: false,
		isManagingAllSites: false,
	};

	stopPropagation = ( event ) => {
		event.stopPropagation();
	};

	onToggle = ( event ) => {
		if ( this.props.onToggle ) {
			this.props.onToggle( event.target.checked );
		}
	};

	handleHeaderClick = ( event ) => {
		const { column } = event.currentTarget.dataset;
		this.props.onChangeSortOrder( column );
	};

	handleSelectChange = ( option ) => {
		const sortKey = option.value.slice( 0, -1 );
		const sortOrder = option.value.slice( -1 ) === '+' ? 1 : -1;
		this.props.onChangeSortOrder( sortKey, sortOrder );
	};

	renderSortIcon( column, sortKey, sortOrder ) {
		if ( ! column?.isSortable ) {
			return null;
		}

		const isActiveColumn = sortKey === column.name;
		const columnSortOrder = isActiveColumn ? sortOrder : column.initialSortOrder;

		return <Icon icon={ columnSortOrder === 1 ? arrowDown : arrowUp } size={ 16 } />;
	}

	getSingleSortOption( column, sortOrder ) {
		const { translate } = this.props;
		if ( sortOrder === 1 ) {
			return {
				value: `${ column.name }+`,
				label: translate( '%(column)s ascending', { args: { column: column.label } } ),
			};
		}
		return {
			value: `${ column.name }-`,
			label: translate( '%(column)s descending', { args: { column: column.label } } ),
		};
	}

	prepareSortOptions( columns ) {
		return columns
			.filter( ( column ) => column.label && column.isSortable )
			.map( ( column ) => {
				if ( column.supportsOrderSwitching ) {
					return [
						this.getSingleSortOption( column, column.initialSortOrder ),
						this.getSingleSortOption( column, column.initialSortOrder * -1 ),
					];
				}
				return [ this.getSingleSortOption( column, column.initialSortOrder ) ];
			} )
			.flat();
	}

	renderHeaderContent() {
		const { headerClasses, activeSortKey, activeSortOrder, columns } = this.props;
		const listHeaderClasses = classNames(
			'domain-table-header',
			'domain-table-header__desktop',
			headerClasses
		);
		const listHeaderMobileClasses = classNames(
			'domain-table-header',
			'domain-table-header__mobile',
			headerClasses
		);

		return (
			<>
				<div className={ listHeaderMobileClasses }>
					<SelectDropdown
						onSelect={ this.handleSelectChange }
						selectedIcon={ <MaterialIcon icon="sort" /> }
						options={ this.prepareSortOptions( columns ) }
						initialSelected={ activeSortKey + ( activeSortOrder === 1 ? '+' : '-' ) }
					/>
				</div>
				<div className={ listHeaderClasses }>
					{ columns.map( ( column, index ) => (
						<Button
							plain
							key={ `item-${ index }` }
							onClick={ this.handleHeaderClick }
							className={ classNames( 'list__header-column', `list__${ column.name }-cell`, {
								'is-sorted-by': activeSortKey === column.name,
							} ) }
							data-column={ column.name }
						>
							{ column.label } { this.renderSortIcon( column, activeSortKey, activeSortOrder ) }
						</Button>
					) ) }
				</div>
			</>
		);
	}

	render() {
		const { isChecked, disabled, isBusy, headerClasses, translate } = this.props;

		if (
			ListAllActions.editContactInfo === this.props?.action ||
			ListAllActions.editContactEmail === this.props?.action
		) {
			const listHeaderClasses = classNames( 'domain-table-header', headerClasses );
			return (
				<CompactCard className={ listHeaderClasses }>
					<FormCheckbox
						className="list__checkbox"
						onChange={ this.onToggle }
						onClick={ this.stopPropagation }
						checked={ isChecked }
						disabled={ disabled || isBusy }
					/>
					<strong>
						{ translate( 'Update the selected domains with the contact information above.' ) }
					</strong>
				</CompactCard>
			);
		}

		return this.renderHeaderContent();
	}
}

export default localize( DomainsTableHeader );
