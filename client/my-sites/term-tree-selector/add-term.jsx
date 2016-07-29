/**
 * External dependencies
 */
import React, { PropTypes, Component } from 'react';
import ReactDom from 'react-dom';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { find } from 'lodash';

/**
 * Internal dependencies
 */
import Dialog from 'components/dialog';
import TermTreeSelectorTerms from './terms';
import Button from 'components/button';
import Gridicon from 'components/gridicon';
import FormInputValidation from 'components/forms/form-input-validation';
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
import { addTermForPost } from 'state/posts/actions';

class TermSelectorAddTerm extends Component {
	static initialState = {
		showDialog: false,
		selectedParent: [],
		isTopLevel: true,
		isValid: false,
		error: null
	};

	static propTypes = {
		labels: PropTypes.object,
		postType: PropTypes.string,
		postId: PropTypes.number,
		siteId: PropTypes.number,
		terms: PropTypes.array,
		taxonomy: PropTypes.string,
		translate: PropTypes.func
	};

	constructor( props ) {
		super( props );
		this.state = this.constructor.initialState;
		this.boundCloseDialog = this.closeDialog.bind( this );
		this.boundOpenDialog = this.openDialog.bind( this );
		this.boundOnParentChange = this.onParentChange.bind( this );
		this.boundOnSearch = this.onSearch.bind( this );
		this.boundSaveTerm = this.saveTerm.bind( this );
		this.boundOnTopLevelChange = this.onTopLevelChange.bind( this );
		this.boundValidateInput = this.validateInput.bind( this );
	}

	onSearch( searchTerm ) {
		this.setState( { searchTerm: searchTerm } );
	}

	openDialog( event ) {
		event.preventDefault();

		this.setState( {
			showDialog: true,
			selectedParent: []
		} );
	}

	closeDialog() {
		this.setState( this.constructor.initialState );
	}

	onParentChange( item ) {
		this.setState( {
			selectedParent: [ item.ID ],
			isTopLevel: false
		}, this.isValid );
	}

	onTopLevelChange() {
		this.setState( {
			isTopLevel: ! this.state.isTopLevel,
			selectedParent: []
		}, this.isValid );
	}

	getFormValues() {
		const name = ReactDom.findDOMNode( this.refs.termName ).value.trim();
		const parent = this.state.selectedParent.length ? this.state.selectedParent[ 0 ] : 0;

		return { name, parent };
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
				( term.parent === values.parent );
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

	validateInput( event ) {
		if ( 13 === event.keyCode ) {
			this.saveTerm();
		} else {
			this.isValid();
		}
	}

	saveTerm() {
		const term = this.getFormValues();
		if ( ! this.isValid() ) {
			return;
		}

		const { postId, siteId, taxonomy } = this.props;

		this.props.addTermForPost( siteId, taxonomy, term, postId );
		this.closeDialog();
	}

	render() {
		const { labels, siteId, taxonomy, translate, terms } = this.props;
		const buttons = [ {
			action: 'cancel',
			label: translate( 'Cancel' )
		}, {
			action: 'add',
			label: translate( 'Add' ),
			isPrimary: true,
			disabled: ! this.state.isValid,
			onClick: this.boundSaveTerm
		} ];

		const { searchTerm, selectedParent } = this.state;
		const query = {};
		if ( searchTerm && searchTerm.length ) {
			query.search = searchTerm;
		}

		const isError = this.state.error && this.state.error.length;
		const totalTerms = terms ? terms.length : 0;
		const classes = classNames( 'term-tree-selector__add-term', { 'is-compact': totalTerms < 8 } );

		return (
			<div className={ classes }>
				<Button borderless compact={ true } onClick={ this.boundOpenDialog }>
					<Gridicon icon="folder" /> { labels.add_new_item }
				</Button>
				<Dialog
					autoFocus={ false }
					isVisible={ this.state.showDialog }
					buttons={ buttons }
					onClose={ this.boundCloseDialog }
					additionalClassNames="term-tree-selector__add-term-dialog">
					<FormSectionHeading>{ labels.add_new_item }</FormSectionHeading>
					<FormFieldset>
						<FormTextInput
							autoFocus={ this.state.showDialog && ! viewport.isMobile() }
							placeholder={ labels.new_item_name }
							ref="termName"
							isError={ isError }
							onKeyUp={ this.boundValidateInput } />
						{ isError && <FormInputValidation isError text={ this.state.error } /> }
					</FormFieldset>
					<FormFieldset>
						<FormLegend>
							{ labels.parent_item }
						</FormLegend>
						<FormLabel>
							<FormCheckbox ref="topLevel" checked={ this.state.isTopLevel } onChange={ this.boundOnTopLevelChange } />
							<span>{ translate( 'Top level', { context: 'Terms: New term being created is top level' } ) }</span>
						</FormLabel>
						<TermTreeSelectorTerms
							siteId={ siteId }
							taxonomy={ taxonomy }
							onSearch={ this.boundOnSearch }
							onChange={ this.boundOnParentChange }
							query={ query }
							selected={ selectedParent }
						/>
					</FormFieldset>
				</Dialog>
			</div>
		);
	}
}

export default connect(
	( state, ownProps ) => {
		const { taxonomy, postType } = ownProps;
		const siteId = getSelectedSiteId( state );
		const { labels } = getPostTypeTaxonomy( state, siteId, postType, taxonomy ) || {};

		return {
			terms: getTerms( state, siteId, taxonomy ),
			labels,
			siteId
		};
	},
	{ addTermForPost }
)( localize( TermSelectorAddTerm ) );
