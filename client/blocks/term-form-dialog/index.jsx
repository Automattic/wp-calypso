/**
 * External dependencies
 */
import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { get, find, noop, assign } from 'lodash';

/**
 * Internal dependencies
 */
import Dialog from 'components/dialog';
import TermTreeSelectorTerms from 'blocks/term-tree-selector/terms';
import FormInputValidation from 'components/forms/form-input-validation';
import FormTextarea from 'components/forms/form-textarea';
import FormTextInput from 'components/forms/form-text-input';
import FormSectionHeading from 'components/forms/form-section-heading';
import FormCheckbox from 'components/forms/form-checkbox';
import FormLabel from 'components/forms/form-label';
import FormLegend from 'components/forms/form-legend';
import FormFieldset from 'components/forms/form-fieldset';
import viewport from 'lib/viewport';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getPostTypeTaxonomy } from 'state/post-types/taxonomies/selectors';
import { getTerms } from 'state/terms/selectors';
import { addTerm, updateTerm } from 'state/terms/actions';

class TermFormDialog extends Component {
	static initialState = {
		description: '',
		name: '',
		selectedParent: [],
		isTopLevel: true,
		isValid: false,
		error: null
	};

	static propTypes = {
		labels: PropTypes.object,
		onClose: PropTypes.func,
		onSuccess: PropTypes.func,
		postType: PropTypes.string,
		showDescriptionInput: PropTypes.bool,
		showDialog: PropTypes.bool,
		siteId: PropTypes.number,
		taxonomy: PropTypes.string,
		term: PropTypes.object,
		terms: PropTypes.array,
		translate: PropTypes.func
	};

	static defaultProps = {
		onClose: noop,
		onSuccess: noop,
		showDescriptionInput: false,
		showDialog: false
	};

	onSearch = searchTerm => {
		this.setState( { searchTerm: searchTerm } );
	};

	closeDialog = () => {
		this.setState( this.constructor.initialState );
		this.props.onClose();
	};

	onParentChange = item => {
		this.setState( {
			selectedParent: [ item.ID ],
			isTopLevel: false
		}, this.isValid );
	};

	onTopLevelChange = () => {
		this.setState( {
			isTopLevel: ! this.state.isTopLevel,
			selectedParent: []
		}, this.isValid );
	};

	onNameChange = event => {
		this.setState( {
			name: event.target.value
		} );
	};

	onDescriptionChange = event => {
		this.setState( {
			description: event.target.value
		} );
	};

	validateInput = event => {
		if ( 13 === event.keyCode ) {
			this.saveTerm();
		} else {
			this.isValid();
		}
	}

	saveTerm = () => {
		const term = this.getFormValues();
		if ( ! this.isValid() ) {
			return;
		}

		const { siteId, taxonomy } = this.props;
		const isNew = ! this.props.term;
		const savePromise = isNew
			? this.props.addTerm( siteId, taxonomy, term )
			: this.props.updateTerm( siteId, taxonomy, this.props.term.ID, this.props.term.slug, term );

		savePromise.then( this.props.onSuccess );
		this.closeDialog();
	};

	constructor( props ) {
		super( props );
		this.state = this.constructor.initialState;
	}

	init( props ) {
		if ( ! props.term ) {
			this.setState( this.constructor.initialState );
			return;
		}

		const { name, description, parent = false } = props.term;
		this.setState( assign( {}, this.constructor.initialState, {
			name,
			description,
			isTopLevel: parent ? false : true,
			selectedParent: parent ? [ parent ] : []
		} ) );
	}

	componentWillReceiveProps( newProps ) {
		if (
			this.props.term !== newProps.term ||
			this.props.showDialog !== newProps.showDialog
		) {
			this.init( newProps );
		}
	}

	componentDidMount() {
		this.init( this.props );
	}

	getFormValues() {
		const name = this.state.name.trim();
		const formValues = { name };
		if ( this.props.isHierarchical ) {
			formValues.parent = this.state.selectedParent.length ? this.state.selectedParent[ 0 ] : 0;
		}
		if ( this.props.showDescriptionInput ) {
			const description = this.state.description.trim();
			formValues.description = description;
		}

		return formValues;
	}

	isValid() {
		let error;

		const values = this.getFormValues();

		if ( ! values.name.length ) {
			error = true;
		}

		const lowerCasedTermName = values.name.toLowerCase();
		const matchingTerm = find( this.props.terms, ( term ) => {
			return ( term.name.toLowerCase() === lowerCasedTermName ) &&
				( ! this.props.isHierarchical ||
					( term.parent === values.parent && ( ! this.props.term || term.ID !== this.props.term.ID ) )
				);
		} );

		if ( matchingTerm ) {
			error = this.props.translate( 'Name already exists', {
				context: 'Terms: Add term error message - duplicate term name exists',
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
	}

	renderParentSelector() {
		const { labels, siteId, taxonomy, translate } = this.props;
		const { searchTerm, selectedParent } = this.state;
		const query = {};
		if ( searchTerm && searchTerm.length ) {
			query.search = searchTerm;
		}
		const hideTermAndChildren = get( this.props.term, 'ID' );

		return (
			<FormFieldset>
				<FormLegend>
					{ labels.parent_item }
				</FormLegend>
				<FormLabel>
					<FormCheckbox ref="topLevel" checked={ this.state.isTopLevel } onChange={ this.onTopLevelChange } />
					<span>{ translate( 'Top level', { context: 'Terms: New term being created is top level' } ) }</span>
				</FormLabel>
				<TermTreeSelectorTerms
					siteId={ siteId }
					taxonomy={ taxonomy }
					onSearch={ this.onSearch }
					onChange={ this.onParentChange }
					query={ query }
					selected={ selectedParent }
					hideTermAndChildren={ hideTermAndChildren }
				/>
			</FormFieldset>
		);
	}

	render() {
		const { isHierarchical, labels, translate, showDescriptionInput, showDialog } = this.props;
		const { name, description } = this.state;
		const isNew = ! this.props.term;
		const buttons = [ {
			action: 'cancel',
			label: translate( 'Cancel' )
		}, {
			action: isNew ? 'add' : 'update',
			label: isNew ? translate( 'Add' ) : translate( 'Update' ),
			isPrimary: true,
			disabled: ! this.state.isValid,
			onClick: this.saveTerm
		} ];

		const isError = this.state.error && !! this.state.error.length;

		return (
			<Dialog
				autoFocus={ false }
				isVisible={ showDialog }
				buttons={ buttons }
				onClose={ this.closeDialog }
				additionalClassNames={ 'term-form-dialog' }>
				<FormSectionHeading>{ isNew ? labels.add_new_item : labels.edit_item }</FormSectionHeading>
				<FormFieldset>
					<FormTextInput
						autoFocus={ showDialog && ! viewport.isMobile() }
						placeholder={ labels.new_item_name }
						ref="termName"
						isError={ isError }
						onKeyUp={ this.validateInput }
						value={ name }
						onChange={ this.onNameChange }
					/>
					{ isError && <FormInputValidation isError text={ this.state.error } /> }
				</FormFieldset>
				{ showDescriptionInput && <FormFieldset>
						<FormLegend>
							{ translate( 'Description', { context: 'Terms: Term description label' } ) }
						</FormLegend>
						<FormTextarea
							ref="termDescription"
							onKeyUp={ this.validateInput }
							value={ description }
							onChange={ this.onDescriptionChange }
						/>
					</FormFieldset>
				}
				{ isHierarchical && this.renderParentSelector() }
			</Dialog>
		);
	}
}

export default connect(
	( state, ownProps ) => {
		const { taxonomy, postType } = ownProps;
		const siteId = getSelectedSiteId( state );
		const taxonomyDetails = getPostTypeTaxonomy( state, siteId, postType, taxonomy );
		const labels = get( taxonomyDetails, 'labels', {} );
		const isHierarchical = get( taxonomyDetails, 'hierarchical', false );

		return {
			terms: getTerms( state, siteId, taxonomy ),
			isHierarchical,
			labels,
			siteId
		};
	},
	{ addTerm, updateTerm }
)( localize( TermFormDialog ) );
