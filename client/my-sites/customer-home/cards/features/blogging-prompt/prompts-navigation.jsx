import { Button, Gridicon } from '@automattic/components';
import classnames from 'classnames';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import './style.scss';

export class PromptsNavigation extends Component {
	static propTypes = {
		goToPreviousStep: PropTypes.func,
		goToNextStep: PropTypes.func,
		direction: PropTypes.oneOf( [ 'back', 'forward' ] ),
		flowName: PropTypes.string.isRequired,
		labelText: PropTypes.string,
		cssClass: PropTypes.string,
		positionInFlow: PropTypes.number,
		previousPath: PropTypes.string,
		signupProgress: PropTypes.object,
		stepName: PropTypes.string.isRequired,
		// Allows to force a back button in the first step for example.
		allowBackFirstStep: PropTypes.bool,
		rel: PropTypes.string,
		borderless: PropTypes.bool,
		primary: PropTypes.bool,
		backIcon: PropTypes.string,
		forwardIcon: PropTypes.string,
		queryParams: PropTypes.object,
		disabledTracksOnClick: PropTypes.bool,
	};

	static defaultProps = {
		labelText: '',
		allowBackFirstStep: false,
		borderless: true,
		backIcon: 'arrow-left',
		forwardIcon: 'arrow-right',
	};

	handleClick = () => {
		if ( this.props.direction === 'forward' ) {
			console.log( 'forward' );
			this.props.goToNextStep();
		} else if ( this.props.goToPreviousStep ) {
			console.log( 'back' );
			this.props.goToPreviousStep();
		}

		if ( ! this.props.disabledTracksOnClick ) {
			this.recordClick();
		}
	};

	recordClick() {}

	render() {
		const { borderless, primary, backIcon, forwardIcon } = this.props;
		let backGridicon;
		let forwardGridicon;

		if ( this.props.direction === 'back' ) {
			backGridicon = backIcon ? <Gridicon icon={ backIcon } size={ 18 } /> : null;
		}

		if ( this.props.direction === 'forward' ) {
			forwardGridicon = forwardIcon ? <Gridicon icon={ forwardIcon } size={ 18 } /> : null;
		}

		const buttonClasses = classnames(
			'navigation-link',
			this.props.direction,
			this.props.cssClass
		);

		const hrefUrl =
			this.props.direction === 'forward' && this.props.forwardUrl ? this.props.forwardUrl : '';
		return (
			<Button
				primary={ primary }
				borderless={ borderless }
				className={ buttonClasses }
				href={ hrefUrl }
				onClick={ this.handleClick }
				rel={ this.props.rel }
			>
				{ backGridicon }
				{ forwardGridicon }
			</Button>
		);
	}
}

export default connect( () => {}, { recordTracksEvent } )( localize( PromptsNavigation ) );
