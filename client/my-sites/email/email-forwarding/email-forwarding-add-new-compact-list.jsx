import { Button, Gridicon } from '@automattic/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import FormButton from 'calypso/components/forms/form-button';
import { validateAllFields } from 'calypso/lib/domains/email-forwarding';
import formState from 'calypso/lib/form-state';
import EmailForwardingAddNewCompact from 'calypso/my-sites/email/email-forwarding/email-forwarding-add-new-compact';
import EmailForwardingLimit from './email-forwarding-limit';

class EmailForwardingAddNewCompactList extends Component {
	static propTypes = {
		emailForwards: PropTypes.array,
		emailForwardingLimit: PropTypes.number.isRequired,
		selectedDomainName: PropTypes.string.isRequired,
	};

	state = {
		forwards: [ { destination: '', mailbox: '' } ],
	};

	getInitialFields() {
		return [ { destination: '', mailbox: '' } ];
	}

	getInitialFormState() {
		return {
			formSubmitting: false,
			forwards: [ { destination: '', mailbox: '' } ],
		};
	}

	UNSAFE_componentWillMount() {
		this.formStateController = formState.Controller( {
			initialFields: this.getInitialFields(),
			onNewState: this.setFormState,
			validatorFunction: ( fieldValues, onComplete ) => {
				onComplete( null, validateAllFields( fieldValues ) );
			},
		} );

		this.setFormState( this.formStateController.getInitialState() );
	}

	hasForwards() {
		return this.props.emailForwards.length > 0;
	}

	hasReachedLimit() {
		return this.props.emailForwards.length >= this.props.emailForwardingLimit;
	}

	addNewEmailForwardsClick = ( event ) => {
		event.preventDefault();

		if ( this.state.formSubmitting ) {
			return;
		}

		this.setState( { formSubmitting: true } );

		this.formStateController.handleSubmit( ( hasErrors ) => {
			if ( hasErrors ) {
				this.setState( { formSubmitting: false } );
				return;
			}

			const { mailbox, destination } = formState.getAllFieldValues( this.state.fields );

			this.props.addNewEmailForwardWithAnalytics(
				this.props.selectedDomainName,
				mailbox,
				destination
			);
			this.formStateController.resetFields( this.getInitialFields() );
			this.setState( { formSubmitting: false, showForm: true } );
		} );
	};

	setFormState = ( fields ) => {
		this.setState( { fields } );
	};

	onForwardAdd = () => {
		this.setState( { forwards: [ ...this.state.forwards, { destination: '', mailbox: '' } ] } );
		//onUsersChange( [ ...users, newUser( selectedDomainName ) ] );
	};

	addButton() {
		const { translate } = this.props;
		return (
			<div className="email-forwarding-add-new-compact-list__actions">
				<Button
					className="email-forwarding-add-new-compact-list__add-another-forward-button"
					onClick={ this.onForwardAdd }
				>
					<Gridicon icon="plus" />
					<span>{ translate( 'Add another forward' ) }</span>
				</Button>

				<Button primary onClick={ this.addNewEmailForwardsClick }>
					{ translate( 'Add' ) }
				</Button>
			</div>
		);
	}

	removeButton() {
		return (
			<FormButton type="button" isPrimary={ false } onClick={ this.removeClick }>
				{ this.props.translate( 'Remove' ) }
			</FormButton>
		);
	}

	formFooter() {
		return <div>{ this.addButton() }</div>;
	}

	removeHandler = ( index ) => {
		const array = this.state.forwards;
		array.splice( index, 1 );

		this.setState( { forwards: array } );
	};

	updateHandler = ( index, name, value ) => {
		const array = this.state.forwards;
		array[ index ][ name ] = value;
		debugger;
		const field = `${ name }${ index }`;
		this.formStateController.handleFieldChange( {
			name: field,
			value,
		} );

		this.setState( { forwards: array } );
	};

	render() {
		const { emailForwards, emailForwardingLimit, selectedDomainName } = this.props;
		const totalFowards = emailForwards.length + this.state.forwards.length;
		return (
			<>
				{ totalFowards > 0 ? (
					<EmailForwardingLimit
						emailForwardingCount={ totalFowards }
						emailForwardingLimit={ emailForwardingLimit }
					/>
				) : null }
				{ this.state.forwards.map( ( fields, index ) => (
					<>
						<form className="email-forwarding__add-new">
							<EmailForwardingAddNewCompact
								fields={ fields }
								index={ index }
								emailForwards={ emailForwards }
								selectedDomainName={ selectedDomainName }
								removeHandler={ this.removeHandler }
								updateHandler={ this.updateHandler }
							/>
						</form>
						<hr />
					</>
				) ) }
				{ this.formFooter() }
			</>
		);
	}
}

export default connect( null, {} )( localize( EmailForwardingAddNewCompactList ) );
