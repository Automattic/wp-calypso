import { Button, Card, Popover, Gridicon } from '@automattic/components';
import { isWithinBreakpoint } from '@automattic/viewport';
import classnames from 'classnames';
import { createRef, Component, Fragment } from 'react';
import FormCheckbox from 'calypso/components/forms/form-checkbox';
import FormLabel from 'calypso/components/forms/form-label';
import MobileSelectPortal from '../mobile-select-portal';

export class TypeSelector extends Component {
	state = {
		userHasSelected: false,
		selectedCheckboxes: [],
	};

	typeButton = createRef();

	resetTypeSelector = ( event ) => {
		const { selectType } = this.props;
		selectType( [] );
		event.preventDefault();
	};

	handleToggleAllTypesSelector = () => {
		const { types } = this.props;
		const selectedCheckboxes = this.getSelectedCheckboxes();
		if ( ! selectedCheckboxes.length ) {
			this.setState( {
				userHasSelected: true,
				selectedCheckboxes: types.map( ( type ) => type.key ),
			} );
		} else {
			this.setState( {
				userHasSelected: true,
				selectedCheckboxes: [],
			} );
		}
	};

	handleSelectClick = ( event ) => {
		const type = event.target.getAttribute( 'id' );
		const selectedCheckboxes = this.getSelectedCheckboxes();
		const parentTypeKey = this.props.parentType?.key;
		const isParentType = type === parentTypeKey;
		const parentTypeIndex = selectedCheckboxes.indexOf( parentTypeKey );
		const hasAllIssues = parentTypeIndex > -1;
		if ( hasAllIssues && ! isParentType ) {
			selectedCheckboxes.splice( parentTypeIndex, 1 );
		}
		if ( selectedCheckboxes.includes( type ) ) {
			this.setState( {
				userHasSelected: true,
				selectedCheckboxes: selectedCheckboxes.filter( ( ch ) => ch !== type ),
			} );
		} else {
			this.setState( {
				userHasSelected: true,
				selectedCheckboxes: isParentType
					? [ parentTypeKey ]
					: [ ...new Set( selectedCheckboxes ).add( type ) ],
			} );
		}
	};

	getSelectedCheckboxes = () => {
		if ( this.state.userHasSelected ) {
			return this.state.selectedCheckboxes;
		}
		const key = this.props.typeKey || 'group';
		if ( this.props.filter?.[ key ]?.length ) {
			return this.props.filter[ key ];
		}
		return [];
	};

	typeKeyToName = ( key ) => {
		const { types, isNested, parentType } = this.props;
		const allTypes = [ ...types ];
		if ( isNested ) {
			allTypes.push( parentType );
		}
		const match = allTypes.find( ( item ) => item.key === key );
		return match?.name ?? key;
	};

	handleClose = () => {
		const { onClose } = this.props;

		this.setState( {
			userHasSelected: false,
			selectedCheckboxes: [],
		} );
		onClose();
	};

	handleApplyFilters = () => {
		const { selectType } = this.props;
		const selectedCheckboxes = this.getSelectedCheckboxes();
		selectType( selectedCheckboxes );
		this.handleClose();
	};

	humanReadable = ( count ) => {
		if ( count >= 1000 ) {
			return this.props.translate( '%(number_over_thousand)d K+', {
				args: {
					number_over_thousand: Math.floor( ( count / 1000 ) * 10 ) / 10,
				},
			} );
		}
		return count;
	};

	renderCheckbox = ( item ) => {
		return (
			<FormLabel key={ item.key }>
				<FormCheckbox
					id={ item.key }
					checked={ this.isSelected( item.key ) }
					name={ item.key }
					onChange={ this.handleSelectClick }
				/>
				{ item.count ? item.name + ' (' + this.humanReadable( item.count ) + ')' : item.name }
			</FormLabel>
		);
	};

	renderCheckboxSelection = () => {
		const { translate, types, isNested, parentType } = this.props;
		const selectedCheckboxes = this.getSelectedCheckboxes();

		return (
			<div className="type-selector__activity-types-selection-wrap">
				{ types && !! types.length && (
					<div>
						<Fragment>
							{ isNested ? (
								<ul className="type-selector__nested-checkbox">
									<li>{ this.renderCheckbox( parentType ) }</li>
									<ul>
										<li className="type-selector__activity-types-selection-granular">
											{ types.map( this.renderCheckbox ) }
										</li>
									</ul>
								</ul>
							) : (
								<div className="type-selector__activity-types-selection-granular">
									{ types.map( this.renderCheckbox ) }
								</div>
							) }
						</Fragment>
						<div className="type-selector__activity-types-selection-info">
							<div className="type-selector__date-range-info">
								{ selectedCheckboxes.length === 0 && (
									<Button borderless compact onClick={ this.handleToggleAllTypesSelector }>
										{ translate( '{{icon/}} select all', {
											components: { icon: <Gridicon icon="checkmark" /> },
										} ) }
									</Button>
								) }
								{ selectedCheckboxes.length !== 0 && (
									<Button borderless compact onClick={ this.handleToggleAllTypesSelector }>
										{ translate( '{{icon/}} clear', {
											components: { icon: <Gridicon icon="cross-small" /> },
										} ) }
									</Button>
								) }
							</div>
							<Button
								className="type-selector__activity-types-apply"
								primary
								compact
								disabled={ ! this.state.userHasSelected }
								onClick={ this.handleApplyFilters }
							>
								{ translate( 'Apply' ) }
							</Button>
						</div>
					</div>
				) }
				{ ! types && [ 1, 2, 3 ].map( this.renderPlaceholder ) }
				{ types && ! types.length && (
					<p>{ translate( 'No activities recorded in the selected date range.' ) }</p>
				) }
			</div>
		);
	};

	renderPlaceholder = ( i ) => {
		return (
			<div
				className="type-selector__activity-types-selection-placeholder"
				key={ 'placeholder' + i }
			/>
		);
	};

	isSelected = ( key ) => this.getSelectedCheckboxes().includes( key );

	hasSelectedCheckboxes = () => this.getSelectedCheckboxes().length > 0;

	renderTypeSelectorButton = () => {
		const { isNested, isVisible, showAppliedFiltersCount, title, translate } = this.props;
		const selectedCheckboxes = this.getSelectedCheckboxes();
		const hasSelectedCheckboxes = this.hasSelectedCheckboxes();

		const buttonClass = classnames( 'filterbar__selection', {
			'is-selected': hasSelectedCheckboxes,
			'is-active': isVisible && ! hasSelectedCheckboxes,
		} );

		// If the type selector is nested, we don't want to display the title
		// unless there are no selected checkboxes.
		const shouldDisplayTitle = ! isNested || ( isNested && ! hasSelectedCheckboxes );

		// If the type selector is not nested and has selected checkboxes, we want to display a delimiter.
		const shouldDisplayDelimiter = ! isNested && hasSelectedCheckboxes;

		const activitiesSelectedText = translate(
			'%(selectedCount)s activity selected',
			'%(selectedCount)s activities selected',
			{
				count: selectedCheckboxes.length,
				args: {
					selectedCount: selectedCheckboxes.length,
				},
			}
		);

		// Decide the display content for selected checkboxes
		const selectedCheckboxesContent = showAppliedFiltersCount
			? activitiesSelectedText
			: selectedCheckboxes.map( this.typeKeyToName ).join( ', ' );

		return (
			<Button
				className={ buttonClass }
				compact
				borderless
				onClick={ this.props.onButtonClick }
				ref={ this.typeButton }
			>
				{ shouldDisplayTitle && title }
				{ shouldDisplayDelimiter && <span>: </span> }
				{ hasSelectedCheckboxes && selectedCheckboxesContent }
			</Button>
		);
	};

	render() {
		const { isVisible, isNested } = this.props;
		const hasSelectedCheckboxes = this.hasSelectedCheckboxes();

		return (
			<Fragment>
				{ this.renderTypeSelectorButton() }
				{ hasSelectedCheckboxes && (
					<Button
						className="type-selector__selection-close"
						compact
						borderless
						onClick={ this.resetTypeSelector }
					>
						<Gridicon icon="cross-small" />
					</Button>
				) }
				{ isWithinBreakpoint( '>660px' ) && (
					<Popover
						id="filterbar__activity-types"
						isVisible={ isVisible }
						onClose={ this.handleClose }
						position={ isNested ? 'bottom left' : 'bottom' }
						relativePosition={ { left: -80 } }
						context={ this.typeButton.current }
					>
						{ this.renderCheckboxSelection() }
					</Popover>
				) }
				{ ! isWithinBreakpoint( '>660px' ) && (
					<MobileSelectPortal isVisible={ isVisible }>
						<Card>{ this.renderCheckboxSelection() }</Card>
					</MobileSelectPortal>
				) }
			</Fragment>
		);
	}
}
