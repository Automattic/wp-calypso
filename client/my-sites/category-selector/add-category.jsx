/**
 * External dependencies
 */
var ReactDom = require( 'react-dom' ),
	React = require( 'react' ),
	classNames = require( 'classnames' );

/**
 * Internal dependencies
 */
var Dialog = require( 'components/dialog' ),
	CategoryList = require( 'components/data/category-list-data' ),
	CategorySelector = require( 'my-sites/category-selector' ),
	CategoryStore = require( 'lib/terms/category-store-factory' )( 'default' ),
	TermActions = require( 'lib/terms/actions' ),
	Button = require( 'components/button' ),
	Gridicon = require( 'components/gridicon' ),
	FormInputValidation = require( 'components/forms/form-input-validation' ),
	FormTextInput = require( 'components/forms/form-text-input' ),
	FormSectionHeading = require( 'components/forms/form-section-heading' ),
	FormCheckbox = require( 'components/forms/form-checkbox' ),
	FormLabel = require( 'components/forms/form-label' ),
	InfoPopover = require( 'components/info-popover' ),
	FormLegend = require( 'components/forms/form-legend' ),
	FormFieldset = require( 'components/forms/form-fieldset' ),
	viewport = require( 'lib/viewport' );

/**
 * Component
 */
module.exports = React.createClass( {
	displayName: 'CategorySelectorAddCategory',

	propTypes: {
		siteId: React.PropTypes.number,
		categories: React.PropTypes.array,
		categoriesFound: React.PropTypes.number,
		searching: React.PropTypes.bool,
		searchThreshold: React.PropTypes.number,
	},

	getInitialState: function() {
		return {
			showDialog: false,
			searchTerm: null,
			selectedParent: [],
			isTopLevel: true,
			isValid: false,
			error: null
		};
	},

	getDefaultProps: function() {
		return {
			searchThreshold: 8
		};
	},

	onSearch: function( searchTerm ) {
		this.setState( { searchTerm: searchTerm } );
	},

	openDialog: function( event ) {
		event.preventDefault();

		this.setState( {
			showDialog: true,
			selectedParent: []
		} );
	},

	closeDialog: function() {
		this.setState( this.getInitialState() );
	},

	onParentChange: function( item ) {
		this.setState( {
			selectedParent: [ item.ID ],
			isTopLevel: false
		} );
	},

	onTopLevelChange: function() {
		this.setState( {
			isTopLevel: ! this.state.isTopLevel,
			selectedParent: []
		} );
	},

	getSelectedValues: function() {
		var categoryName = ReactDom.findDOMNode( this.refs.categoryName ).value.trim(),
			parent = this.state.selectedParent.length ? this.state.selectedParent[ 0 ] : 0;

		return {
			name: categoryName,
			parent: parent
		};
	},

	isValid: function() {
		var values, error, existingMatches, newCategoryNameLowerCased;

		values = this.getSelectedValues();

		newCategoryNameLowerCased = values.name.toLowerCase();

		if ( ! values.name.length ) {
			error = true;
		}

		existingMatches = CategoryStore.getAllNames( this.props.siteId ).some( function( name ) {
			return name.toLowerCase() === newCategoryNameLowerCased;
		} );

		if ( existingMatches ) {
			error = this.translate( 'Name already exists', {
				context: 'Categories: Add category error message - duplicate category name exists',
				textOnly: true
			} );
		}

		if ( error !== this.state.error ) {
			this.setState( {
				error: error,
				isValid: ! error
			} );
		}

		return ! error;
	},

	validateInput: function( event ) {
		if ( 13 === event.keyCode ) {
			this.saveCategory();
		} else {
			this.isValid();
		}
	},

	saveCategory: function() {
		var values = this.getSelectedValues();

		if ( ! this.isValid() ) {
			return;
		}

		TermActions.addCategory( this.props.siteId, values.name, values.parent );
		this.closeDialog();
	},

	render: function() {
		var buttons, addCategoryString, classes, isError;

		buttons = [ {
			action: 'cancel',
			label: this.translate( 'Cancel' )
		}, {
			action: 'add',
			label: this.translate( 'Add' ),
			isPrimary: true,
			disabled: ! this.state.isValid,
			onClick: this.saveCategory
		} ];

		isError = this.state.error && this.state.error.length;

		classes = classNames( 'category-selector__add-category', {
			'is-compact': ( this.props.categories && this.props.categoriesFound <= this.props.searchThreshold ) && ! this.props.searching
		} );

		addCategoryString = this.translate( 'Add a new category' );

		return (
			<div className={ classes }>
				<Button borderless compact={ true } onClick={ this.openDialog }>
					<Gridicon icon="folder" /> { addCategoryString }
				</Button>
				<Dialog
					autoFocus={ false }
					isVisible={ this.state.showDialog }
					buttons={ buttons }
					onClose={ this.closeDialog }
					additionalClassNames="category-selector__add-category-dialog">
					<FormSectionHeading>{ addCategoryString }</FormSectionHeading>
					<FormFieldset>
						<FormTextInput
							autoFocus={ this.state.showDialog && ! viewport.isMobile() }
							placeholder={ this.translate( 'New category name' ) }
							ref="categoryName"
							isError={ isError }
							onKeyUp={ this.validateInput } />
						{ isError ? <FormInputValidation isError={ true } text={ this.state.error } /> : null }
					</FormFieldset>
					<FormFieldset>
						<FormLegend>
							{ this.translate( 'Choose a parent category', { context: 'Categories: select a parent category when creating a new category' } ) }
							<InfoPopover className="category-selector__add-category-info" position="bottom" gaEventCategory="Editor" popoverName="Add Category Parent">
								<p className="category-selector__add-category-info-message">
									{ this.translate(
										'If you choose an existing category as the parent, your new category will be created as a child of the selected category.',
										{ context: 'Categories: info popover text shown when creating a new category and selecting a parent category.' }
									) }
								</p>
							</InfoPopover>
						</FormLegend>
						<FormLabel>
							<FormCheckbox ref="topLevel" checked={ this.state.isTopLevel } onChange={ this.onTopLevelChange } />
							<span>{ this.translate( 'Top level category', { context: 'Categories: New category being created is top level i.e. has no parent' } ) }</span>
						</FormLabel>
						<CategoryList siteId={ this.props.siteId } search={ this.state.searchTerm } categoryStoreId="parent" >
						<CategorySelector
							onSearch={ this.onSearch }
							analyticsPrefix="Add Category"
							onChange={ this.onParentChange }
							className="category-selector__add-category-selector"
							multiple={ false }
							selected={ this.state.selectedParent } />
						</CategoryList>
					</FormFieldset>
				</Dialog>
			</div>
		);
	},
} );
