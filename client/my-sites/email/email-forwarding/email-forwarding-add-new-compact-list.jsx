import { Button, Gridicon } from '@automattic/components';
import { localize } from 'i18n-calypso';
import page from 'page';
import PropTypes from 'prop-types';
import { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import FormButton from 'calypso/components/forms/form-button';
import { validateAllFields } from 'calypso/lib/domains/email-forwarding';
import EmailForwardingAddNewCompact from 'calypso/my-sites/email/email-forwarding/email-forwarding-add-new-compact';
import { emailManagement } from 'calypso/my-sites/email/paths';
import {
	composeAnalytics,
	recordGoogleEvent,
	recordTracksEvent,
	withAnalytics,
} from 'calypso/state/analytics/actions';
import { addEmailForward } from 'calypso/state/email-forwarding/actions';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
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

	addNewEmailForwardWithAnalytics = ( domainName, mailbox, destination ) =>
		withAnalytics(
			composeAnalytics(
				recordGoogleEvent(
					'Domain Management',
					'Clicked "Add New Email Forward" Button in Email Forwarding',
					'Domain Name',
					domainName
				),
				recordTracksEvent(
					'calypso_domain_management_email_forwarding_add_new_email_forward_click',
					{
						destination,
						domain_name: domainName,
						mailbox,
					}
				)
			)
		);

	addNewEmailForwardsClick = ( event ) => {
		const { selectedSiteSlug } = this.props;

		event.preventDefault();

		if ( this.state.formSubmitting ) {
			return;
		}

		this.setState( { formSubmitting: true } );

		this.state.forwards.map( ( t ) => {
			const { mailbox, destination } = t;

			this.addNewEmailForwardWithAnalytics( this.props.selectedDomainName, mailbox, destination );
			this.props.addEmailForward( this.props.selectedDomainName, mailbox, destination );
		} );

		this.setState( { formSubmitting: false } );
		page( emailManagement( selectedSiteSlug, this.props.selectedDomainName ) );
	};

	onForwardAdd = () => {
		this.setState( { forwards: [ ...this.state.forwards, { destination: '', mailbox: '' } ] } );
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

				<Button
					primary
					onClick={ this.addNewEmailForwardsClick }
					disabled={ ! this.validForwards() }
				>
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
					<Fragment key={ `fragment-${ index }` }>
						<form className="email-forwarding__add-new" key={ `form-${ index }` }>
							<EmailForwardingAddNewCompact
								key={ `forward-${ index }` }
								fields={ fields }
								index={ index }
								emailForwards={ this.state.forwards }
								selectedDomainName={ selectedDomainName }
								removeHandler={ this.removeHandler }
								updateHandler={ this.updateHandler }
							/>
						</form>
						<hr key={ `hr-${ index }` } />
					</Fragment>
				) ) }
				{ this.formFooter() }
			</>
		);
	}
}

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		return {
			selectedSiteSlug: getSiteSlug( state, siteId ),
		};
	},
	{ addEmailForward }
)( localize( EmailForwardingAddNewCompactList ) );
