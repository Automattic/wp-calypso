/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var SelectDropdown = require( 'components/select-dropdown' ),
	DropdownItem = require( 'components/select-dropdown/item' ),
	DropdownSeparator = require( 'components/select-dropdown/separator' );

var SelectDropdownDemo = React.createClass( {
	displayName: 'SelectDropdown',

	mixins: [ React.addons.PureRenderMixin ],

	getInitialState: function() {
		return {
			childSelected: 'Published',
			selectedCount: 10
		};
	},

	getDefaultProps: function() {
		return {
			options: [
				{ value: 'published', label: 'Published' },
				{ value: 'scheduled', label: 'Scheduled' },
				{ value: 'drafts', label: 'Drafts' },
				null,
				{ value: 'trashed', label: 'Trashed' }
			]
		};
	},

	render: function() {
		return (
			<div className="design-assets__group">
				<h2>
					<a href="/devdocs/design/select-dropdown">Select Dropdown</a>
				</h2>

				<h3>items passed as options prop</h3>
				<SelectDropdown
					options={ this.props.options }
					onSelect={ this.onDropdownSelect } />

				<h3 style={ { marginTop: 20 } }>items passed as children</h3>
				<SelectDropdown
					onSelect={ this.onDropdownSelect }
					selectedText={ this.state.childSelected }
					selectedCount={ this.state.selectedCount }
				>
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
						selected={ this.state.childSelected === 'Drafts' }
						onClick={ this.selectItem.bind( this, 'Drafts', null ) }
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
			</div>
		);
	},

	selectItem: function( childSelected, count, event ) {
		event.preventDefault();

		this.setState( {
			childSelected: childSelected,
			selectedCount: count
		} );

		console.log( 'Select Dropdown Item (selected):', childSelected );
	},

	onDropdownSelect: function( option ) {
		console.log( 'Select Dropdown (selected):', option );
	}
} );

module.exports = SelectDropdownDemo;
