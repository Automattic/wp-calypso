/**
 * External Dependencies
 */
import React, { Component } from 'react';
import { localize, LocalizeProps } from 'i18n-calypso';
import { connect } from 'react-redux';
import { get } from 'lodash';

/**
 * Internal Dependencies
 */
import StepWrapper from 'signup/step-wrapper';
import wpcom from 'lib/wp';
import Card from 'components/card';
import Image from 'components/image';

interface Props {
	flowName: string;
	goToNextStep: ( flowName?: string ) => void;
	positionInFlow: number;
	signupProgress: object[];
	stepName: string;
}

interface State {
	publicId: string | null;
	business: {
		name?: string | null;
		image?: string | null;
		address?: string | null;
	};
}

class RivetConfirmation extends Component< Props & ConnectedProps & LocalizeProps > {
	state: State = {
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
			.then( ( { publicId, site: { contact: { address }, images, title } }: any ) => {
				const image = get( images, '[0].url', null );
				this.setState( { publicId, business: { name: title, address, image } } );
			} )
			.catch();
	};

	renderContent = () => {
		const { business } = this.state;
		return (
			<Card>
				{ business.image && <Image src={ business.image } /> }
				{ business.name && (
					<div>
						<strong>{ business.name }</strong>
					</div>
				) }
				{ business.address && <div>{ business.address }</div> }
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

const mapStateToProps = ( state: object, { signupDependencies: { placeId } }: any ) => ( {
	placeId,
} );

const mapDispatchToProps = {};

type ConnectedProps = ReturnType< typeof mapStateToProps > & typeof mapDispatchToProps;

export default connect(
	mapStateToProps,
	mapDispatchToProps
)( localize( RivetConfirmation ) );
