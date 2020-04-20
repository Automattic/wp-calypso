/**
 * External dependencies
 */

import React from 'react';
import Gridicon from 'components/gridicon';

/**
 * Internal dependencies
 */
import SelectDropdown from 'components/select-dropdown';

class SelectDropdownExample extends React.PureComponent {
	static displayName = 'SelectDropdownExample';

	static defaultProps = {
		options: [
			{ value: 'status-options', label: 'Statuses', isLabel: true },
			{ value: 'published', label: 'Published', count: 12 },
			{ value: 'scheduled', label: 'Scheduled' },
			{ value: 'drafts', label: 'Drafts' },
			null,
			{ value: 'trashed', label: 'Trashed' },
		],
	};

	state = {
		childSelected: 'Published',
		selectedCount: 10,
		compactButtons: false,
		selectedIcon: <Gridicon icon="align-image-left" size={ 18 } />,
	};

	toggleButtons = () => {
		this.setState( { compactButtons: ! this.state.compactButtons } );
	};

	render() {
		const toggleButtonsText = this.state.compactButtons ? 'Normal Buttons' : 'Compact Buttons';

		return (
			<div className="docs__select-dropdown-container">
				<button className="docs__design-toggle button" onClick={ this.toggleButtons }>
					{ toggleButtonsText }
				</button>

				<h3>Items passed as options prop</h3>
				<SelectDropdown
					compact={ this.state.compactButtons }
					options={ this.props.options }
					onSelect={ this.onDropdownSelect }
				/>

				<h3 style={ { marginTop: 20 } }>Items passed as children</h3>
				<SelectDropdown
					compact={ this.state.compactButtons }
					onSelect={ this.onDropdownSelect }
					selectedText={ this.state.childSelected }
					selectedCount={ this.state.selectedCount }
				>
					<SelectDropdown.Label>
						<strong>Statuses</strong>
					</SelectDropdown.Label>

					<SelectDropdown.Item
						count={ 10 }
						selected={ this.state.childSelected === 'Published' }
						onClick={ this.getSelectItemHandler( 'Published', 10 ) }
					>
						Published
					</SelectDropdown.Item>

					<SelectDropdown.Item
						count={ 4 }
						selected={ this.state.childSelected === 'Scheduled' }
						onClick={ this.getSelectItemHandler( 'Scheduled', 4 ) }
					>
						Scheduled
					</SelectDropdown.Item>

					<SelectDropdown.Item
						count={ 3343 }
						selected={ this.state.childSelected === 'Drafts' }
						onClick={ this.getSelectItemHandler( 'Drafts', 3343 ) }
					>
						Drafts
					</SelectDropdown.Item>

					<SelectDropdown.Separator />

					<SelectDropdown.Item
						count={ 3 }
						selected={ this.state.childSelected === 'Trashed' }
						onClick={ this.getSelectItemHandler( 'Trashed', 3 ) }
					>
						Trashed
					</SelectDropdown.Item>
				</SelectDropdown>

				<h3 style={ { marginTop: 20 } }>With Icons in Items Passed as Options</h3>
				<SelectDropdown
					compact={ this.state.compactButtons }
					onSelect={ this.onDropdownSelect }
					options={ [
						{
							value: 'published',
							label: 'Published',
							icon: <Gridicon icon="align-image-left" size={ 18 } />,
						},
						{
							value: 'scheduled',
							label: 'Scheduled',
							icon: <Gridicon icon="calendar" size={ 18 } />,
						},
						{
							value: 'drafts',
							label: 'Drafts',
							icon: <Gridicon icon="create" size={ 18 } />,
						},
						{
							value: 'trashed',
							label: 'Trashed',
							icon: <Gridicon icon="trash" size={ 18 } />,
						},
					] }
				/>

				<h3 style={ { marginTop: 20 } }>With Icons in Items Passed as Children</h3>
				<SelectDropdown
					compact={ this.state.compactButtons }
					onSelect={ this.onDropdownSelect }
					selectedText={ this.state.childSelected }
					selectedIcon={ this.state.selectedIcon }
				>
					<SelectDropdown.Label>
						<strong>Statuses</strong>
					</SelectDropdown.Label>

					<SelectDropdown.Item
						selected={ this.state.childSelected === 'Published' }
						icon={ <Gridicon icon="align-image-left" size={ 18 } /> }
						onClick={ this.getSelectItemHandler(
							'Published',
							10,
							<Gridicon icon="align-image-left" size={ 18 } />
						) }
					>
						Published
					</SelectDropdown.Item>

					<SelectDropdown.Item
						selected={ this.state.childSelected === 'Scheduled' }
						icon={ <Gridicon icon="calendar" size={ 18 } /> }
						onClick={ this.getSelectItemHandler(
							'Scheduled',
							4,
							<Gridicon icon="calendar" size={ 18 } />
						) }
					>
						Scheduled
					</SelectDropdown.Item>

					<SelectDropdown.Item
						selected={ this.state.childSelected === 'Drafts' }
						icon={ <Gridicon icon="create" size={ 18 } /> }
						onClick={ this.getSelectItemHandler(
							'Drafts',
							3343,
							<Gridicon icon="create" size={ 18 } />
						) }
					>
						Drafts
					</SelectDropdown.Item>

					<SelectDropdown.Separator />

					<SelectDropdown.Item
						selected={ this.state.childSelected === 'Trashed' }
						icon={ <Gridicon icon="trash" size={ 18 } /> }
						onClick={ this.getSelectItemHandler(
							'Trashed',
							3,
							<Gridicon icon="trash" size={ 18 } />
						) }
					>
						Trashed
					</SelectDropdown.Item>
				</SelectDropdown>

				<h3 style={ { marginTop: 20 } }>max-width: 220px;</h3>
				<SelectDropdown
					className="select-dropdown-example__fixed-width"
					compact={ this.state.compactButtons }
					onSelect={ this.onDropdownSelect }
					selectedText="Published publish publish publish"
					selectedCount={ 10 }
				>
					<SelectDropdown.Label>
						<strong>Statuses</strong>
					</SelectDropdown.Label>
					<SelectDropdown.Item count={ 10 } selected={ true }>
						Published publish publish publish
					</SelectDropdown.Item>
					<SelectDropdown.Item count={ 4 }> Scheduled scheduled</SelectDropdown.Item>
					<SelectDropdown.Item count={ 3343 }>Drafts</SelectDropdown.Item>
					<SelectDropdown.Item disabled={ true }>Disabled Item</SelectDropdown.Item>
					<SelectDropdown.Separator />
					<SelectDropdown.Item count={ 3 }>Trashed</SelectDropdown.Item>
				</SelectDropdown>

				<h3 style={ { marginTop: 20 } }>Disabled State</h3>
				<SelectDropdown
					compact={ this.state.compactButtons }
					options={ this.props.options }
					onSelect={ this.onDropdownSelect }
					disabled={ true }
				/>
			</div>
		);
	}

	getSelectItemHandler = ( name, count, icon ) => {
		return ( event ) => {
			event.preventDefault();
			this.selectItem( name, count, icon );
		};
	};

	selectItem = ( childSelected, count, icon ) => {
		this.setState( {
			childSelected: childSelected,
			selectedCount: count,
			selectedIcon: icon,
		} );

		// eslint-disable-next-line no-console
		console.log( 'Select Dropdown Item (selected):', childSelected );
	};

	onDropdownSelect( option ) {
		// eslint-disable-next-line no-console
		console.log( 'Select Dropdown (selected):', option );
	}
}

export default SelectDropdownExample;
