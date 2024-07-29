import { Count, Gridicon, FormLabel } from '@automattic/components';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import FormInputCheckbox from 'calypso/components/forms/form-checkbox';

import './style.scss';

export class BulkSelect extends Component {
	static displayName = 'BulkSelect';

	static propTypes = {
		id: PropTypes.string,
		totalElements: PropTypes.number.isRequired,
		selectedElements: PropTypes.number.isRequired,
		onToggle: PropTypes.func.isRequired,
	};

	getStateIcon = () => {
		if ( this.hasSomeElementsSelected() ) {
			return <Gridicon className="bulk-select__some-checked-icon" icon="minus-small" size={ 18 } />;
		}
	};

	hasAllElementsSelected = () => {
		return (
			this.props.isChecked ??
			( this.props.selectedElements && this.props.selectedElements === this.props.totalElements )
		);
	};

	hasSomeElementsSelected = () => {
		return (
			this.props.isHalfChecked ??
			( this.props.selectedElements && this.props.selectedElements < this.props.totalElements )
		);
	};

	handleToggleAll = () => {
		const newCheckedState = ! ( this.hasSomeElementsSelected() || this.hasAllElementsSelected() );
		this.props.onToggle( newCheckedState );
	};

	render() {
		const { translate, ariaLabel = translate( 'Select All' ), disabled = false } = this.props;
		const isChecked = this.hasAllElementsSelected();
		const inputClasses = clsx( 'bulk-select__box', {
			// TODO: We might be able to remove this class in favor of the :checked pseudoselector.
			'is-checked': isChecked,
		} );

		return (
			<span className="bulk-select">
				<FormLabel className="bulk-select__container">
					<FormInputCheckbox
						className={ inputClasses }
						checked={ isChecked }
						onChange={ this.handleToggleAll }
						aria-label={ ariaLabel }
						disabled={ disabled }
					/>
					<Count count={ this.props.selectedElements } />
					{ this.getStateIcon() }
				</FormLabel>
			</span>
		);
	}
}

export default localize( BulkSelect );
