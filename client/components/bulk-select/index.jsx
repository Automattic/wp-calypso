/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';
import Gridicon from 'components/gridicon';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Count from 'components/count';

/**
 * Style dependencies
 */
import './style.scss';

export class BulkSelect extends React.Component {
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
		return this.props.selectedElements && this.props.selectedElements === this.props.totalElements;
	};

	hasSomeElementsSelected = () => {
		return this.props.selectedElements && this.props.selectedElements < this.props.totalElements;
	};

	handleToggleAll = () => {
		const newCheckedState = ! ( this.hasSomeElementsSelected() || this.hasAllElementsSelected() );
		this.props.onToggle( newCheckedState );
	};

	render() {
		const { translate, ariaLabel = translate( 'Select All' ) } = this.props;
		const isChecked = this.hasAllElementsSelected();
		const inputClasses = classNames( 'bulk-select__box', {
			// We need to add this CSS class to be able to test if the input if checked,
			// since Enzyme still doesn't support :checked pseudoselector.
			'is-checked': isChecked,
		} );

		return (
			<span className="bulk-select">
				<label className="bulk-select__container">
					<input
						type="checkbox"
						className={ inputClasses }
						checked={ isChecked }
						onChange={ this.handleToggleAll }
						aria-label={ ariaLabel }
					/>
					<Count count={ this.props.selectedElements } />
					{ this.getStateIcon() }
				</label>
			</span>
		);
	}
}

export default localize( BulkSelect );
