/**
 * External dependencies
 */
import React, { PropTypes, Component } from 'react';
import ReactDom from 'react-dom';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { get, find, noop } from 'lodash';

/**
 * Internal dependencies
 */
import Dialog from 'components/dialog';
import TermTreeSelectorTerms from './terms';
import Button from 'components/button';
import Gridicon from 'components/gridicon';
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
import { addTerm } from 'state/terms/actions';

class TermSelectorAddTerm extends Component {
	static initialState = {
		description: '',
		name: '',
		showDialog: false,
		selectedParent: [],
		isTopLevel: true,
		isValid: false,
		error: null
	};

	static propTypes = {
		description: PropTypes.string,
		labels: PropTypes.object,
		onSuccess: PropTypes.func,
		postId: PropTypes.number,
		postType: PropTypes.string,
		name: PropTypes.string,
		showDescriptionInput: PropTypes.bool,
		siteId: PropTypes.number,
		taxonomy: PropTypes.string,
		term: PropTypes.object,
		terms: PropTypes.array,
		translate: PropTypes.func
	};

	static defaultProps = {
		onSuccess: noop,
		showDescriptionInput: false
	};

	constructor( props ) {
		super( props );
		this.state = this.constructor.initialState;
	}

	onSearch = searchTerm => {
		this.setState( { searchTerm: searchTerm } );
	};

	openDialog = event => {
		event.preventDefault();

		this.setState( {
			showDialog: true,
			selectedParent: []
		} );
	};

	closeDialog = () => {
		this.setState( this.constructor.initialState );
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

	willReceiveProps( newProps ) {
		if ( this.props.term === newProps.term ) {
			return;
		}

		const { name, description, parent = false } = newProps.term;
		this.setState( {
			name,
			description,
			isTopLevel: parent ? false : true,
			selectedParent: parent ? [ parent ] : []
		} );
	}

	getFormValues() {
		const name = ReactDom.findDOMNode( this.refs.termName ).value.trim();
		const formValues = { name };
		if ( this.props.isHierarchical ) {
			formValues.parent = this.state.selectedParent.length ? this.state.selectedParent[ 0 ] : 0;
		}
		if ( this.props.showDescriptionInput ) {
			formValues.description = ReactDom.findDOMNode( this.refs.termDescription ).value.trim();
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
				( ! this.props.isHierarchical || ( term.parent === values.parent ) );
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
			: this.props.updateTerm( siteId, taxonomy, this.props.term.ID, term );

		savePromise.then( this.props.onSuccess );
		this.closeDialog();
	};

	renderParentSelector() {
		const { labels, siteId, taxonomy, translate } = this.props;
		const { searchTerm, selectedParent } = this.state;
		const query = {};
		if ( searchTerm && searchTerm.length ) {
			query.search = searchTerm;
		}

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
				/>
			</FormFieldset>
		);
	}

	render() {
		const { isHierarchical, labels, translate, terms, showDescriptionInput } = this.props;
		const { name, description } = this.state;
		const buttons = [ {
			action: 'cancel',
			label: translate( 'Cancel' )
		}, {
			action: 'add',
			label: translate( 'Add' ),
			isPrimary: true,
			disabled: ! this.state.isValid,
			onClick: this.saveTerm
		} ];

		const isError = this.state.error && this.state.error.length;
		const totalTerms = terms ? terms.length : 0;
		const classes = classNames( 'term-tree-selector__add-term', { 'is-compact': totalTerms < 8 } );

		return (
			<div className={ classes }>
				<Button borderless compact={ true } onClick={ this.openDialog }>
					<Gridicon icon="folder" /> { labels.add_new_item }
				</Button>
				<Dialog
					autoFocus={ false }
					isVisible={ this.state.showDialog }
					buttons={ buttons }
					onClose={ this.closeDialog }
					additionalClassNames="term-tree-selector__add-term-dialog">
					<FormSectionHeading>{ labels.add_new_item }</FormSectionHeading>
					<FormFieldset>
						<FormTextInput
							autoFocus={ this.state.showDialog && ! viewport.isMobile() }
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
			</div>
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
	{ addTerm }
)( localize( TermSelectorAddTerm ) );
