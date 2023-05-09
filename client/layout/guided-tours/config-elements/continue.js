import { Gridicon } from '@automattic/components';
import { translate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { contextTypes } from '../context-types';
import { targetForSlug } from '../positioning';

export default class Continue extends Component {
	static displayName = 'Continue';

	static contextTypes = contextTypes;

	static propTypes = {
		click: PropTypes.bool,
		hidden: PropTypes.bool,
		icon: PropTypes.string,
		step: PropTypes.string.isRequired,
		target: PropTypes.string,
		when: PropTypes.func,
	};

	constructor( props, context ) {
		super( props, context );
	}

	componentDidMount() {
		this.addTargetListener();
	}

	componentWillUnmount() {
		this.removeTargetListener();
	}

	componentDidUpdate() {
		this.props.when && this.context.isValid( this.props.when ) && this.onContinue();

		this.removeTargetListener();
		this.addTargetListener();
	}

	onContinue = () => {
		const { next, tour, tourVersion, step } = this.context;
		const { step: nextStepName } = this.props;
		next( { tour, tourVersion, step, nextStepName } );
	};

	addTargetListener() {
		const { target = false, click, when } = this.props;
		const targetNode = targetForSlug( target );

		if ( click && ! when && targetNode && targetNode.addEventListener ) {
			targetNode.addEventListener( 'click', this.onContinue );
			targetNode.addEventListener( 'touchstart', this.onContinue );
		}
	}

	removeTargetListener() {
		const { target = false, click, when } = this.props;
		const targetNode = targetForSlug( target );

		if ( click && ! when && targetNode && targetNode.removeEventListener ) {
			targetNode.removeEventListener( 'click', this.onContinue );
			targetNode.removeEventListener( 'touchstart', this.onContinue );
		}
	}

	defaultMessage() {
		return this.props.icon
			? translate( 'Click the {{icon/}} to continue.', {
					components: { icon: <Gridicon icon={ this.props.icon } /> },
			  } )
			: translate( 'Click to continue.' );
	}

	render() {
		if ( this.props.hidden ) {
			return null;
		}

		return (
			<p className="guided-tours__actionstep-instructions">
				<em>{ this.props.children || this.defaultMessage() }</em>
			</p>
		);
	}
}
