/**
 * External Dependencies
 */
import React, { Component } from 'react';
import { localize, LocalizeProps } from 'i18n-calypso';
import { connect } from 'react-redux';
import { pickBy } from 'lodash';

/**
 * Internal Dependencies
 */
import StepWrapper from 'signup/step-wrapper';
import wpcom from 'lib/wp';
import Card from 'components/card';
import Image from 'components/image';
import Button from 'components/button';
import { recordTracksEvent } from 'state/analytics/actions';
import { getBusinessAddress } from 'state/signup/steps/business-details/selectors';
import { saveSignupStep, submitSignupStep } from 'state/signup/progress/actions';

/**
 * Style dependencies
 */
import './style.scss';

interface Suggestion {
	list: {
		id: string;
		text: string;
		image?: string;
	};
}

interface Props {
	flowName: string;
	goToNextStep: ( flowName?: string ) => void;
	positionInFlow: number;
	signupProgress: object[];
	stepName: string;
}

interface BusinessContact {
	title?: string;
	address?: string;
	geo?: string;
	email?: string;
	phone?: string;
	placeId?: string;
}

interface Business extends BusinessContact {
	image?: string;
}

interface State {
	publicId: string | null;
	business: Business;
}

class RivetConfirmation extends Component< Props & ConnectedProps & LocalizeProps > {
	state: State = {
		publicId: null,
		business: {},
	};

	componentDidMount() {
		this.requestRivetSource();
	}

	requestRivetSource = () => {
		const { placeId } = this.props;

		wpcom
			.undocumented()
			.getRivetSource( 'new', { placeId } )
			.then( ( { publicId, site, suggestions = [] }: any ) => {
				const [ image ] = suggestions.reduce(
					( images: string[], suggestion: Suggestion ) =>
						suggestion.list.image ? images.concat( suggestion.list.image ) : images,
					[]
				);
				const contact: BusinessContact = pickBy( site.contact );
				this.setState( { publicId, business: { ...contact, image } } );
			} )
			.catch();
	};

	handleSubmit = () => {
		const { flowName, stepName } = this.props;
		const { business, publicId } = this.state;

		// Fallback to user's address input if rivet doesn't find a business address.
		const businessContact = {
			...business,
			address: business.address || this.props.businessAddress,
		};
		this.props.submitSignupStep( { stepName, flowName }, { businessContact, rivetId: publicId } );
		// @todo: continue tracking this event?
		this.props.recordTracksEvent( 'calypso_signup_actions_submit_business_confirmation', {
			rivet_id: publicId,
		} );
		this.props.goToNextStep();
	};

	renderContent = () => {
		const { translate } = this.props;
		const { business } = this.state;
		return (
			<Card>
				<h2>{ translate( 'Is this your business?' ) }</h2>
				{ business.image && <Image src={ business.image } /> }
				{ business.title && (
					<div>
						<strong>{ business.title }</strong>
					</div>
				) }
				{ business.address && <div>{ business.address }</div> }
				<Button primary onClick={ this.handleSubmit }>
					{ translate( 'Continue' ) }
				</Button>
			</Card>
		);
	};

	render() {
		return (
			<StepWrapper
				flowName={ this.props.flowName }
				stepName={ this.props.stepName }
				positionInFlow={ this.props.positionInFlow }
				fallbackHeaderText={ this.props.translate( 'Confirm your business.' ) }
				signupProgress={ this.props.signupProgress }
				stepContent={ this.renderContent() }
			/>
		);
	}
}

const mapStateToProps = ( state: object, { signupDependencies: { placeId } }: any ) => ( {
	businessAddress: getBusinessAddress( state ),
	placeId,
} );

const mapDispatchToProps = {
	saveSignupStep,
	submitSignupStep,
	recordTracksEvent,
};

type ConnectedProps = ReturnType< typeof mapStateToProps > & typeof mapDispatchToProps;

export default connect(
	mapStateToProps,
	mapDispatchToProps
)( localize( RivetConfirmation ) );
