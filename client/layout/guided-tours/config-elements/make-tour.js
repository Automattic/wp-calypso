/**
 * External dependencies
 */

import { Component } from 'react';
import PropTypes from 'prop-types';
import { isEmpty, omit } from 'lodash';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import { tourBranching } from '../tour-branching';
import { contextTypes } from '../context-types';

const debug = debugFactory( 'calypso:guided-tours' );

const makeTour = ( tree ) => {
	return class TourContext extends Component {
		static propTypes = {
			isValid: PropTypes.func.isRequired,
			lastAction: PropTypes.object,
			next: PropTypes.func.isRequired,
			quit: PropTypes.func.isRequired,
			shouldPause: PropTypes.bool.isRequired,
			sectionName: PropTypes.string,
			stepName: PropTypes.string.isRequired,
			dispatch: PropTypes.func.isRequired,
		};

		static childContextTypes = contextTypes;

		static meta = omit( tree.props, 'children' );

		state = {
			tourContext: {},
		};

		getChildContext() {
			return this.state.tourContext;
		}

		static getDerivedStateFromProps( props ) {
			const {
				isValid,
				lastAction,
				next,
				quit,
				start,
				sectionName,
				shouldPause,
				stepName,
				dispatch,
			} = props;
			const step = stepName;
			const branching = tourBranching( tree );

			const tourContext = {
				next,
				quit,
				start,
				isValid,
				lastAction,
				sectionName,
				shouldPause,
				step,
				branching,
				isLastStep: isEmpty( branching[ step ] ),
				tour: tree.props.name,
				tourVersion: tree.props.version,
				dispatch,
			};

			debug( 'makeTour#getDerivedStateFromProps computed new context', props, tourContext );

			return { tourContext };
		}

		render() {
			return tree;
		}
	};
};

export default makeTour;
