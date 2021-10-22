import { Button, CompactCard } from '@automattic/components';
import { Icon, arrowDown, arrowUp } from '@wordpress/icons';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import FormCheckbox from 'calypso/components/forms/form-checkbox';
import SelectDropdown from 'calypso/components/select-dropdown';
import { ListAllActions } from 'calypso/my-sites/domains/domain-management/list/utils';

import './style.scss';

class DomainsTableHeader extends PureComponent {
	static propTypes = {
		action: PropTypes.string,
		headerClasses: PropTypes.object,
		isChecked: PropTypes.bool,
		disabled: PropTypes.bool,
		isBusy: PropTypes.bool,
		onToggle: PropTypes.func,
		isManagingAllSites: PropTypes.bool,
		onHeaderClick: PropTypes.func,
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
		this.props.onHeaderClick( column );
	};

	renderSortIcon( sortOrder ) {
		if ( sortOrder === 1 ) {
			return <Icon icon={ arrowDown } size={ 16 } />;
		}

		if ( sortOrder === -1 ) {
			return <Icon icon={ arrowUp } size={ 16 } />;
		}

		return null;
	}

	renderHeaderContent() {
		const { headerClasses, activeSortKey, activeSortOrder, translate } = this.props;
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
		const columns = [
			{ name: 'domain', label: translate( 'Domain' ) },
			{ name: 'status', label: translate( 'Status' ) },
			{ name: 'registered-until', label: translate( 'Registered until' ) },
			{ name: 'auto-renew', label: translate( 'Auto-renew' ) },
			{ name: 'email', label: translate( 'Email' ) },
			{ name: 'action', label: null },
		];

		return (
			<>
				<div className={ listHeaderMobileClasses }>
					<SelectDropdown compact onSelect={ this.handleSelectChange } />
				</div>
				<div className={ listHeaderClasses }>
					{ columns.map( ( column, index ) => (
						<Button
							plain
							key={ `item-${ index }` }
							onClick={ this.handleHeaderClick }
							className={ classNames( 'list__header-column', `list__${ column.name }-cell` ) }
							data-column={ column.name }
						>
							{ column.label }{ ' ' }
							{ activeSortKey === column.name && this.renderSortIcon( activeSortOrder ) }
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
