/**
 * External dependencies
 */
import { Component, Children } from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import { updateApiState } from './registry';

export function createApiClientProvider() {
	class ApiClientProvider extends Component {
		static propTypes = {
			apiReduxRoot: PropTypes.string.isRequired,
			children: PropTypes.element.isRequired,
			dispatch: PropTypes.func.isRequired,
		};

		constructor() {
			super( ...arguments );
		}

		componentDidMount() {
			const { apiState, dispatch } = this.props;
			updateApiState( apiState, dispatch );
		}

		componentDidUpdate() {
			const { apiState, dispatch } = this.props;
			updateApiState( apiState, dispatch );
		}

		componentWillReceiveProps( nextProps ) {
			const { apiState, dispatch } = nextProps;
			if ( this.props.apiState !== apiState ) {
				updateApiState( apiState, dispatch );
			}
		}

		render() {
			return Children.only( this.props.children );
		}
	}

	function mapStateToProps( state, ownProps ) {
		const apiState = get( state, ownProps.apiReduxRoot );

		return {
			apiState,
		};
	}

	return connect( mapStateToProps )( ApiClientProvider );
}

export default createApiClientProvider();
