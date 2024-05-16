import debugFactory from 'debug';
import { localize } from 'i18n-calypso';
import { Component } from 'react';
import ProgressItem from './progress-item';

import './style.scss';

const debug = debugFactory( 'calypso:me:security:2fa-progress' );

class Security2faProgress extends Component {
	static displayName = 'Security2faProgress';

	componentDidMount() {
		debug( this.constructor.displayName + ' React component is mounted.' );
	}

	componentWillUnmount() {
		debug( this.constructor.displayName + ' React component will unmount.' );
	}

	stepClass = ( step ) => {
		const currentStep = parseInt( this.props.step, 10 );

		return {
			isHighlighted: step === currentStep,
			isCompleted: step < currentStep,
		};
	};

	render() {
		const { isSmsFlow } = this.props;
		return (
			<div className="security-2fa-progress__container">
				<div className="security-2fa-progress__inner-container">
					{ isSmsFlow && (
						<ProgressItem
							label={ this.props.translate( 'Enter Phone Number' ) }
							icon="chat"
							step={ this.stepClass( 1 ) }
						/>
					) }

					<ProgressItem
						label={ this.props.translate( 'Verify Code' ) }
						icon="lock"
						step={ this.stepClass( 2 ) }
					/>

					<ProgressItem
						label={ this.props.translate( 'Generate Backup Codes' ) }
						icon="sync"
						step={ this.stepClass( 3 ) }
					/>
				</div>
			</div>
		);
	}
}

export default localize( Security2faProgress );
