import { Button, Card, Popover, FormLabel, Gridicon } from '@automattic/components';
import { isWithinBreakpoint } from '@automattic/viewport';
import { Icon, chevronDown } from '@wordpress/icons';
import clsx from 'clsx';
import { createRef, Component, Fragment } from 'react';
import FormCheckbox from 'calypso/components/forms/form-checkbox';
import MobileSelectPortal from '../mobile-select-portal';

export class TypeSelector extends Component {
	static defaultProps = {
		variant: 'default',
	};

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
			// Find the type object to see if it has children
			const typeToUnselect = this.props.types.find( ( typeItem ) => typeItem.key === type );

			// If the type has children, we'll need to remove them as well
			let checkboxesToKeep = selectedCheckboxes;
			if ( typeToUnselect && typeToUnselect.children ) {
				const childrenKeys = typeToUnselect.children.map( ( child ) => child.key );
				checkboxesToKeep = selectedCheckboxes.filter( ( ch ) => ! childrenKeys.includes( ch ) );
			}

			// Remove the type from the selection
			const updatedSelection = checkboxesToKeep.filter( ( ch ) => ch !== type );

			this.setState( {
				userHasSelected: true,
				selectedCheckboxes: updatedSelection,
			} );
		} else {
			let updatedSelection = new Set( selectedCheckboxes );

			// If it's a parent type, we simply use the parentTypeKey
			if ( isParentType ) {
				updatedSelection = new Set( [ parentTypeKey ] );
			} else {
				// Find the type object and add its children if it has any
				const currentType = this.props.types.find( ( typeItem ) => typeItem.key === type );
				if ( currentType && currentType.children ) {
					currentType.children.forEach( ( child ) => updatedSelection.add( child.key ) );
				}
				// Always add the type itself to the selection
				updatedSelection.add( type );
			}

			this.setState( {
				userHasSelected: true,
				selectedCheckboxes: [ ...updatedSelection ],
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

	/**
	 * Resolves a Activity Type key to its corresponding display name.
	 *
	 * It searches the provided `key` through all `types` and its potential children recursively.
	 * If the key is found, the corresponding name is returned.
	 * If the key is not found, it returns the key itself as a fallback.
	 * @param {string} key - Activity Type key
	 * @returns {string} - The resolved display name or the key itself if not found.
	 */
	typeKeyToName = ( key ) => {
		const { types, isNested, parentType } = this.props;
		const allTypes = [ ...types ];
		if ( isNested ) {
			allTypes.push( parentType );
		}

		const findKeyInTypes = ( typesList, targetKey ) => {
			for ( const item of typesList ) {
				if ( item.key === targetKey ) {
					return item.name;
				}

				if ( item.children ) {
					const name = findKeyInTypes( item.children, targetKey );
					if ( name ) {
						// If the parent type has a name, we want to prepend it to the child type name.
						return item.name ? item.name + ' ' + name : name;
					}
				}
			}
			return null;
		};

		return findKeyInTypes( allTypes, key ) ?? key;
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

		const selectorCheckboxes = (
			<ul className="type-selector__nested-checkbox">
				{ types.map( ( type ) => {
					if ( type.children ) {
						return (
							<Fragment key={ type.key }>
								<li>{ this.renderCheckbox( type ) }</li>
								<ul>
									<li className="type-selector__activity-types-selection-granular">
										{ type.children.map( this.renderCheckbox ) }
									</li>
								</ul>
							</Fragment>
						);
					}
					return this.renderCheckbox( type );
				} ) }
			</ul>
		);

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
									{ selectorCheckboxes }
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
		const { isNested, isVisible, showAppliedFiltersCount, title, translate, variant } = this.props;

		const isCompact = variant === 'compact';
		const isMobile = ! isWithinBreakpoint( '>660px' );

		const selectedCheckboxes = this.getSelectedCheckboxes();
		const hasSelectedCheckboxes = this.hasSelectedCheckboxes();

		const buttonClass = clsx( 'filterbar__selection', {
			'is-selected': hasSelectedCheckboxes,
			'is-active': isVisible && ! hasSelectedCheckboxes,
		} );

		// Hide the title when is nested with no selected checkboxes, or not nested, has selected checkboxes, and is mobile.
		const shouldDisplayTitle =
			( ! isNested || ( isNested && ! hasSelectedCheckboxes ) ) &&
			! ( isMobile && hasSelectedCheckboxes );

		// Hide the delimiter when is not nested and has selected checkboxes, or is mobile.
		const shouldDisplayDelimiter = ! isNested && hasSelectedCheckboxes && ! isMobile;

		const activitiesSelectedText = translate( '%(selectedCount)s selected', {
			args: {
				selectedCount: selectedCheckboxes.length,
			},
		} );

		// Decide the display content for selected checkboxes
		const selectedCheckboxesContent =
			showAppliedFiltersCount && selectedCheckboxes.length > 1
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
				<span className="button-label">
					{ shouldDisplayTitle && title }
					{ shouldDisplayDelimiter && ': ' }
					{ hasSelectedCheckboxes && selectedCheckboxesContent }
				</span>
				{ isCompact && <Icon icon={ chevronDown } size="16" fill="currentColor" /> }
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
