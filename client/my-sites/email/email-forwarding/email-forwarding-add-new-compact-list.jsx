import { Button, Gridicon } from '@automattic/components';
import { localize } from 'i18n-calypso';
import page from 'page';
import PropTypes from 'prop-types';
import { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { validateAllFields } from 'calypso/lib/domains/email-forwarding';
import EmailForwardingAddNewCompact from 'calypso/my-sites/email/email-forwarding/email-forwarding-add-new-compact';
import { composeAnalytics, withAnalytics } from 'calypso/state/analytics/actions';
import { addEmailForward } from 'calypso/state/email-forwarding/actions';
import getEmailForwardingLimit from 'calypso/state/selectors/get-email-forwarding-limit';
import {
	addEmailForwardSuccess,
	getEmailForwards,
	isAddingEmailForward,
} from 'calypso/state/selectors/get-email-forwards';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

class EmailForwardingAddNewCompactList extends Component {
	static propTypes = {
		emailForwards: PropTypes.array,
		emailForwardingLimit: PropTypes.number,
		onConfirmEmailForwarding: PropTypes.func.isRequired,
		onSuccessRedirectDestination: PropTypes.string,
		selectedDomainName: PropTypes.string.isRequired,
	};

	constructor( props ) {
		super( props );
		this.state = {
			emailForwards: [ { destination: '', mailbox: '', isValid: false } ],
		};
	}

	hasValidEmailForwards() {
		return ! this.state.emailForwards?.some( ( forward ) => ! forward.isValid );
	}

	addNewEmailForwardWithAnalytics = ( domainName, mailbox, destination ) => {
		withAnalytics(
			composeAnalytics(
				this.props.onConfirmEmailForwarding(),
				this.props.addEmailForward( domainName, mailbox, destination )
			)
		);
	};

	addNewEmailForwardsClick = ( event ) => {
		const { selectedSiteSlug, selectedDomainName } = this.props;

		event.preventDefault();

		if ( this.props.isAddingEmailForward ) {
			return;
		}

		this.state.emailForwards?.map( ( forward ) => {
			const { mailbox, destination } = forward;

			this.addNewEmailForwardWithAnalytics(
				selectedDomainName,
				mailbox,
				destination,
				selectedSiteSlug
			);
		} );
	};

	onForwardAdd = () => {
		this.setState( {
			emailForwards: [ ...this.state.emailForwards, { destination: '', mailbox: '' } ],
		} );
	};

	renderActionsButtons( addMoreButton = false ) {
		const { translate } = this.props;
		return (
			<div className="email-forwarding-add-new-compact-list__actions">
				{ addMoreButton && (
					<Button
						className="email-forwarding-add-new-compact-list__add-another-forward-button"
						onClick={ this.onForwardAdd }
					>
						<Gridicon icon="plus" />
						<span>{ translate( 'Add another forward' ) }</span>
					</Button>
				) }

				<Button
					primary
					onClick={ this.addNewEmailForwardsClick }
					disabled={ ! this.hasValidEmailForwards() }
				>
					{ translate( 'Add' ) }
				</Button>
			</div>
		);
	}

	onRemoveEmailForward = ( index ) => {
		const [ emailForwards ] = this.state;
		emailForwards.splice( index, 1 );
		this.setState( { emailForwards } );
	};

	onUpdateEmailForward = ( index, name, value ) => {
		const emailForwards = this.state.emailForwards;
		emailForwards[ index ][ name ] = value;

		const validEmailForward = validateAllFields( emailForwards[ index ] );
		emailForwards[ index ].isValid =
			validEmailForward.mailbox.length === 0 && validEmailForward.destination.length === 0;

		this.setState( { emailForwards } );
	};

	componentDidUpdate() {
		const { emailForwardSuccess, onSuccessRedirectDestination } = this.props;

		if ( emailForwardSuccess && onSuccessRedirectDestination ) {
			page( onSuccessRedirectDestination );
		}
	}

	render() {
		const { selectedDomainName } = this.props;

		return (
			<>
				{ this.state.emailForwards?.map( ( fields, index ) => (
					<Fragment key={ `email-forwarding__add-new_fragment__card-${ index }` }>
						<form className="email-forwarding__add-new">
							<EmailForwardingAddNewCompact
								fields={ fields }
								index={ index }
								emailForwards={ this.state.emailForwards }
								selectedDomainName={ selectedDomainName }
								onRemoveEmailForward={ this.onRemoveEmailForward }
								onUpdateEmailForward={ this.onUpdateEmailForward }
							/>
						</form>
						<hr key={ `email-forwarding__add-new_hr-${ index }` } />
					</Fragment>
				) ) }
				<div>{ this.renderActionsButtons() }</div>
			</>
		);
	}
}

export default connect(
	( state, ownProps ) => {
		return {
			emailForwardSuccess: addEmailForwardSuccess( state, ownProps.selectedDomainName ),
			selectedSiteSlug: getSiteSlug( state, getSelectedSiteId( state ) ),
			isAddingEmailForward: isAddingEmailForward( state, ownProps.selectedDomainName ),
			emailForwards: getEmailForwards( state, ownProps.selectedDomainName ),
			emailForwardingLimit: getEmailForwardingLimit( state, getSelectedSiteId( state ) ),
		};
	},
	{ addEmailForward }
)( localize( EmailForwardingAddNewCompactList ) );
