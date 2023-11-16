import PropTypes from 'prop-types';
import { Component, useEffect } from 'react';
import { connect, useDispatch } from 'react-redux';
import { requestThemeFilters } from 'calypso/state/themes/actions';

export class QueryThemeFilters extends Component {
	static propTypes = {
		requestThemeFilters: PropTypes.func.isRequired,
	};

	componentDidMount() {
		this.props.requestThemeFilters();
	}

	render() {
		return null;
	}
}

export default connect( null, { requestThemeFilters } )( QueryThemeFilters );

export function useQueryThemeFilters() {
	const dispatch = useDispatch();

	useEffect( () => {
		dispatch( requestThemeFilters() );
	}, [ dispatch ] );

	return null;
}
