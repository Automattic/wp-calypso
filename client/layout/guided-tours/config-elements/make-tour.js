import { omit } from '@automattic/js-utils';
import debugFactory from 'debug';
import { isEmpty } from 'lodash';
import PropTypes from 'prop-types';
import { Component, createElement } from 'react';
import { TourContext } from '../context';
import { tourBranching } from '../tour-branching';

const debug = debugFactory( 'calypso:guided-tours' );

const makeTour = ( tree ) => {
	return class TourContextProvider extends Component {
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

		static meta = omit( tree.props, 'children' );

		state = {
			tourContext: {},
		};

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
			return createElement( TourContext.Provider, { value: this.state.tourContext }, tree );
		}
	};
};

export default makeTour;
