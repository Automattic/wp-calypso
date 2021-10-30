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
		forwards: [ { destination: '', mailbox: '', valid: false } ],
		formSubmitting: false,
	};

	hasForwards() {
		return this.props.emailForwards.length > 0;
	}

	hasReachedLimit() {
		return this.props.emailForwards.length >= this.props.emailForwardingLimit;
	}

	validForwards() {
		return ! this.state.forwards.some( ( t ) => ! t.valid );
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

				<Button primary onClick={ this.addNewEmailForwardsClick } disabled={ ! this.validForwards() }>
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

		const valid = validateAllFields( array[ index ] );
		array[ index ].valid = valid.mailbox.length === 0 && valid.destination.length === 0;

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
