/**
 * External dependencies
 */
import React from 'react';
import PureRenderMixin from 'react-pure-render/mixin';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import SelectDropdown from 'components/select-dropdown';
import DropdownItem from 'components/select-dropdown/item';
import DropdownLabel from 'components/select-dropdown/label';
import DropdownSeparator from 'components/select-dropdown/separator';

const SelectDropdownDemo = React.createClass( {
	displayName: 'SelectDropdown',

	mixins: [ PureRenderMixin ],

	getInitialState: function() {
		return {
			childSelected: 'Published',
			selectedCount: 10,
			compactButtons: false,
			selectedIcon: <Gridicon icon="align-image-left" size={ 18 } />
		};
	},

	getDefaultProps: function() {
		return {
			options: [
				{ value: 'status-options', label: 'Statuses', isLabel: true },
				{ value: 'published', label: 'Published', count: 12 },
				{ value: 'scheduled', label: 'Scheduled' },
				{ value: 'drafts', label: 'Drafts' },
				null,
				{ value: 'trashed', label: 'Trashed' }
			]
		};
	},

	toggleButtons: function() {
		this.setState( { compactButtons: ! this.state.compactButtons } );
	},

	render: function() {
		const toggleButtonsText = this.state.compactButtons
			? 'Normal Buttons'
			: 'Compact Buttons';

		return (
			<div className="docs__select-dropdown-container">
				<a
					className="docs__design-toggle button"
					onClick={ this.toggleButtons }
				>
					{ toggleButtonsText }
				</a>

				<h3>Items passed as options prop</h3>
				<SelectDropdown
					compact={ this.state.compactButtons }
					options={ this.props.options }
					onSelect={ this.onDropdownSelect } />

				<h3 style={ { marginTop: 20 } }>Items passed as children</h3>
				<SelectDropdown
					compact={ this.state.compactButtons }
					onSelect={ this.onDropdownSelect }
					selectedText={ this.state.childSelected }
					selectedCount={ this.state.selectedCount }
				>

					<DropdownLabel><strong>Statuses</strong></DropdownLabel>

					<DropdownItem
						count={ 10 }
						selected={ this.state.childSelected === 'Published' }
						onClick={ this.selectItem.bind( this, 'Published', 10 ) }
					>
						Published
					</DropdownItem>

					<DropdownItem
						count={ 4 }
						selected={ this.state.childSelected === 'Scheduled' }
						onClick={ this.selectItem.bind( this, 'Scheduled', 4 ) }
					>
						Scheduled
					</DropdownItem>

					<DropdownItem
						count={ 3343 }
						selected={ this.state.childSelected === 'Drafts' }
						onClick={ this.selectItem.bind( this, 'Drafts', 3343 ) }
					>
						Drafts
					</DropdownItem>

					<DropdownSeparator />

					<DropdownItem
						count={ 3 }
						selected={ this.state.childSelected === 'Trashed' }
						onClick={ this.selectItem.bind( this, 'Trashed', 3 ) }
					>
						Trashed
					</DropdownItem>
				</SelectDropdown>

				<h3 style={ { marginTop: 20 } }>max-width: 220px;</h3>

				<SelectDropdown
					className="select-dropdown-example__fixed-width"
					compact={ this.state.compactButtons }
					onSelect={ this.onDropdownSelect }
					selectedText="Published publish publish publish"
					selectedCount={ 454 }
				>

					<DropdownLabel><strong>Statuses</strong></DropdownLabel>
					<DropdownItem count={ 10 } selected={ true } >Published publish publish publish</DropdownItem>
					<DropdownItem count={ 4 } > Scheduled scheduled</DropdownItem>
					<DropdownItem>Drafts</DropdownItem>
					<DropdownSeparator />
					<DropdownItem count={ 3 }>Trashed</DropdownItem>
				</SelectDropdown>

				<h3 style={ { marginTop: 20 } }>With Icons</h3>

				<SelectDropdown
					className="select-dropdown-example__fixed-width"
					compact={ this.state.compactButtons }
					onSelect={ this.onDropdownSelect }
					selectedText={ this.state.childSelected }
					selectedIcon={ this.state.selectedIcon }
				>

					<DropdownLabel><strong>Statuses</strong></DropdownLabel>

					<DropdownItem
						selected={ this.state.childSelected === 'Published' }
						icon={ <Gridicon icon="align-image-left" size={ 18 } /> }
						onClick={ this.selectItem.bind( this, 'Published', null, <Gridicon icon="align-image-left" size={ 18 } /> ) }
					>
						Published
					</DropdownItem>

					<DropdownItem
						selected={ this.state.childSelected === 'Scheduled' }
						icon={ <Gridicon icon="calendar" size={ 18 } /> }
						onClick={ this.selectItem.bind( this, 'Scheduled', null, <Gridicon icon="calendar" size={ 18 } /> ) }
					>
						Scheduled
					</DropdownItem>

					<DropdownItem
						selected={ this.state.childSelected === 'Drafts' }
						icon={ <Gridicon icon="create" size={ 18 } /> }
						onClick={ this.selectItem.bind( this, 'Drafts', null, <Gridicon icon="create" size={ 18 } /> ) }
					>
						Drafts
					</DropdownItem>

					<DropdownSeparator />

					<DropdownItem
						count={ 3 }
						selected={ this.state.childSelected === 'Trashed' }
						icon={ <Gridicon icon="trash" size={ 18 } /> }
						onClick={ this.selectItem.bind( this, 'Trashed', null, <Gridicon icon="trash" size={ 18 } /> ) }
					>
						Trashed
					</DropdownItem>
				</SelectDropdown>

			</div>
		);
	},

	selectItem: function( childSelected, count, icon, event ) {
		event.preventDefault();

		this.setState( {
			childSelected: childSelected,
			selectedCount: count,
			selectedIcon: icon
		} );

		console.log( 'Select Dropdown Item (selected):', childSelected );
	},

	onDropdownSelect: function( option ) {
		console.log( 'Select Dropdown (selected):', option );
	}
} );

module.exports = SelectDropdownDemo;
