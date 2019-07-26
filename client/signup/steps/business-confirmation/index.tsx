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
import { getBusinessAddress, getBusinessName } from 'state/signup/steps/business-details/selectors';
import { saveSignupStep, submitSignupStep } from 'state/signup/progress/actions';

/**
 * Style dependencies
 */
import './style.scss';

interface Suggestion {
	type: string;
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

interface SiteContact {
	placeId: string;
	address?: string;
	geo?: string;
	email?: string;
	phone?: string;
}

interface SocialLinks {
	[key: string]: string;
}

interface State {
	businessContact: {
		address?: string;
		email?: string;
		geo?: string;
		phone?: string;
	};
	businessHours: object[];
	businessTitle: string;
	siteImages: object[];
	siteLogoUrl: string;
	socialLinks: SocialLinks;
}

class BusinessConfirmation extends Component< Props & ConnectedProps & LocalizeProps > {
	state: State = {
		businessContact: {},
		businessHours: [],
		businessTitle: '',
		siteImages: [],
		siteLogoUrl: '',
		socialLinks: {},
	};

	componentDidMount() {
		this.props.saveSignupStep( { stepName: this.props.stepName } );
		this.requestRivetSource();
	}

	requestRivetSource = () => {
		const { placeId } = this.props;

		wpcom
			.undocumented()
			.getRivetSource( 'new', { placeId } )
			.then( ( { site: { contact, images, times, title }, suggestions = [] }: any ) => {
				// Get the first image from suggestions, this is usually a site logo or header image.
				const [ siteLogoUrl ] = suggestions.reduce(
					( suggestedImages: string[], suggestion: Suggestion ) =>
						suggestion.list.image
							? suggestedImages.concat( suggestion.list.image )
							: suggestedImages,
					[]
				);
				// Extract social links from suggestions into the format `{ facebook_page: 'https://facebook.com' }`.
				// These are passed to Headstart to build a social menu.
				const socialLinks = suggestions.reduce( ( links: SocialLinks, suggestion: Suggestion ) => {
					const type = `${ suggestion.type }_page`;
					if ( ! links[ type ] ) {
						links[ type ] = suggestion.list.text;
					}
					return links;
				}, {} );

				this.setState( {
					businessContact: pickBy( contact ),
					businessHours: times,
					businessTitle: title,
					siteImages: images,
					siteLogoUrl,
					socialLinks,
				} );
			} )
			.catch();
	};

	handleSubmit = () => {
		const { flowName, stepName } = this.props;
		const { businessHours, siteImages, siteLogoUrl, socialLinks } = this.state;

		// Fallback to user's address input if rivet doesn't find a business address.
		const businessContact = {
			...this.state.businessContact,
			address: this.state.businessContact.address || this.props.businessAddress,
		};
		this.props.submitSignupStep(
			{ stepName, flowName },
			{ businessContact, businessHours, siteImages, siteLogoUrl, socialLinks }
		);
		this.props.goToNextStep();
	};

	renderContent = () => {
		const { translate, businessName } = this.props;
		const { businessContact, businessTitle, siteLogoUrl } = this.state;
		return (
			<Card>
				<h2>{ translate( 'Is this your business?' ) }</h2>
				{ siteLogoUrl && <Image src={ siteLogoUrl } /> }
				{ ( businessTitle || businessName ) && (
					<div>
						<strong>{ businessTitle || businessName }</strong>
					</div>
				) }
				{ businessContact.address && <div>{ businessContact.address }</div> }
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
	businessName: getBusinessName( state ),
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
)( localize( BusinessConfirmation ) );
