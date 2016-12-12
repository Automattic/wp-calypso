/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import {
	isEmpty,
	omit,
} from 'lodash';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import { tourBranching } from '../config-parsing';
import contextTypes from '../context-types';

const debug = debugFactory( 'calypso:guided-tours' );

const makeTour = tree => {
	return class extends Component {
		static propTypes = {
			isValid: PropTypes.func.isRequired,
			lastAction: PropTypes.object,
			next: PropTypes.func.isRequired,
			quit: PropTypes.func.isRequired,
			shouldPause: PropTypes.bool.isRequired,
			stepName: PropTypes.string.isRequired,
		};

		static childContextTypes = contextTypes;

		static meta = omit( tree.props, 'children' );

		getChildContext() {
			return this.tourMeta;
		}

		constructor( props, context ) {
			super( props, context );
			this.setTourMeta( props );
			debug( 'Anonymous#constructor', props, context );
		}

		componentWillReceiveProps( nextProps ) {
			debug( 'Anonymous#componentWillReceiveProps' );
			this.setTourMeta( nextProps );
		}

		setTourMeta( props ) {
			const {
				isValid,
				lastAction,
				next,
				quit,
				start,
				sectionName,
				shouldPause,
				stepName,
			} = props;
			const step = stepName;
			const branching = tourBranching( tree );
			this.tourMeta = {
				next, quit, start, isValid, lastAction, sectionName, shouldPause,
				step,
				branching,
				isLastStep: this.isLastStep( { step, branching } ),
				tour: tree.props.name,
				tourVersion: tree.props.version,
			};
		}

		isLastStep( { step, branching } ) {
			return isEmpty( branching[ step ] );
		}

		render() {
			return tree;
		}
	};
};

export default makeTour;
