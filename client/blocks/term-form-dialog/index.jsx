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
import { recordGoogleEvent, bumpStat } from 'state/analytics/actions';

class TermFormDialog extends Component {
	static initialState = {
		description: '',
		name: '',
		selectedParent: [],
		isTopLevel: true,
		isValid: false,
		errors: {},
		saving: false
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
		translate: PropTypes.func,
		recordGoogleEvent: PropTypes.func,
		bumpStat: PropTypes.func,
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
		if ( this.state.saving ) {
			return;
		}
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
		if ( ! this.isValid() || this.state.saving ) {
			return;
		}

		this.setState( { saving: true } );
		const { siteId, taxonomy } = this.props;
		const statLabels = {
			mc: `edited_${ taxonomy }`,
			ga: `Edited ${ taxonomy }`
		};

		const isNew = ! this.props.term;
		const savePromise = isNew
			? this.props.addTerm( siteId, taxonomy, term )
			: this.props.updateTerm( siteId, taxonomy, this.props.term.ID, this.props.term.slug, term );

		if ( isNew ) {
			statLabels.mc = `created_${ taxonomy }`;
			statLabels.ga = `Created New ${ taxonomy }`;
		}
		this.props.bumpStat( 'taxonomy_manager', statLabels.mc );
		this.props.recordGoogleEvent( 'Taxonomy Manager', statLabels.ga );

		savePromise
			.then( savedTerm => {
				this.setState( { saving: false } );
				this.props.onSuccess( savedTerm );
				this.closeDialog();
			} );
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
			this.props.showDialog !== newProps.showDialog && newProps.showDialog
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
		const errors = {};
		const values = this.getFormValues();

		// Validating the name
		if ( ! values.name.length ) {
			errors.name = this.props.translate( 'Name required', { textOnly: true } );
		}
		const lowerCasedTermName = values.name.toLowerCase();
		const matchingTerm = find( this.props.terms, ( term ) => {
			return (
				term.name.toLowerCase() === lowerCasedTermName &&
				( ! this.props.term || term.ID !== this.props.term.ID )
			);
		} );
		if ( matchingTerm ) {
			errors.name = this.props.translate( 'Name already exists', {
				context: 'Terms: Add term error message - duplicate term name exists',
				textOnly: true
			} );
		}

		// Validating the parent
		if ( this.props.isHierarchical && ! this.state.isTopLevel && ! values.parent ) {
			errors.parent = this.props.translate( 'Parent item required when "Top level" is unchecked', {
				context: 'Terms: Add term error message',
				textOnly: true
			} );
		}

		const isValid = ! Object.keys( errors ).length;
		this.setState( {
			errors,
			isValid
		} );

		return isValid;
	}

	renderParentSelector() {
		const { labels, siteId, taxonomy, translate, terms } = this.props;
		const { searchTerm, selectedParent } = this.state;
		const query = {};
		if ( searchTerm && searchTerm.length ) {
			query.search = searchTerm;
		}
		const hideTermAndChildren = get( this.props.term, 'ID' );
		const isError = !! this.state.errors.parent;

		// if there is only one term for the site, and we are editing that term
		// do not show the parent selector
		if ( hideTermAndChildren && terms && terms.length === 1 ) {
			return null;
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
					isError={ isError }
					onSearch={ this.onSearch }
					onChange={ this.onParentChange }
					query={ query }
					selected={ selectedParent }
					hideTermAndChildren={ hideTermAndChildren }
				/>
				{ isError && <FormInputValidation isError text={ this.state.errors.parent } /> }
			</FormFieldset>
		);
	}

	render() {
		const { isHierarchical, labels, term, translate, showDescriptionInput, showDialog } = this.props;
		const { name, description } = this.state;
		const isNew = ! term;
		const submitLabel = isNew ? translate( 'Add' ) : translate( 'Update' );
		const buttons = [ {
			action: 'cancel',
			label: translate( 'Cancel' )
		}, {
			action: isNew ? 'add' : 'update',
			label: this.state.saving ? translate( 'Saving…' ) : submitLabel,
			isPrimary: true,
			disabled: ! this.state.isValid || this.state.saving,
			onClick: this.saveTerm
		} ];

		const isError = !! this.state.errors.name;

		return (
			<Dialog
				autoFocus={ false }
				isVisible={ showDialog }
				buttons={ buttons }
				onClose={ this.closeDialog }
				additionalClassNames="term-form-dialog">
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
					{ isError && <FormInputValidation isError text={ this.state.errors.name } /> }
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
	{ addTerm, updateTerm, recordGoogleEvent, bumpStat }
)( localize( TermFormDialog ) );
