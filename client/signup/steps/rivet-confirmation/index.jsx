/**
 * External Dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { get } from 'lodash';

/**
 * Internal Dependencies
 */
import StepWrapper from 'signup/step-wrapper';
import wpcom from 'lib/wp';
import Card from 'components/card';

// interface OwnProps {
// 	flowName: string;
// 	stepName: string;
// 	positionInFlow: number;
// 	signupProgress: Array< Object >;
// }

class RivetConfirmation extends Component {
	state = {
		publicId: null,
		business: {
			name: null,
			image: null,
			address: null,
		},
	};

	componentDidMount() {
		this.requestRivetSource();
	}

	requestRivetSource = () => {
		const { placeId } = this.props;

		wpcom
			.undocumented()
			.getRivetSource( 'new', { placeId } )
			.then( ( { publicId, site: { contact: { address }, images, title } } ) => {
				const image = get( images, '[0].url', null );
				this.setState( { publicId, business: { name: title, address, image } } );
			} )
			.catch();
	};

	renderContent = () => {
		const { business } = this.state;
		return (
			<Card>
				{ business.name }
				{ business.address }
				{ business.image }
			</Card>
		);
	};

	render() {
		return (
			<StepWrapper
				flowName={ this.props.flowName }
				stepName={ this.props.stepName }
				positionInFlow={ this.props.positionInFlow }
				fallbackHeaderText={ this.props.translate( 'Create your site.' ) }
				signupProgress={ this.props.signupProgress }
				stepContent={ this.renderContent() }
			/>
		);
	}
}

export default connect(
	( state, { signupDependencies: { placeId } } ) => ( {
		placeId,
	} ),
	{}
)( localize( RivetConfirmation ) );
