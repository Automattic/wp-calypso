import { Component, useEffect } from 'react';
import { connect, useDispatch } from 'react-redux';
import { requestRewindState } from 'calypso/state/rewind/state/actions';

export const useQueryRewindState = ( siteId ) => {
	const dispatch = useDispatch();

	useEffect( () => {
		if ( ! siteId ) {
			return;
		}

		dispatch( requestRewindState( siteId ) );
	}, [ dispatch, siteId ] );
};
export class QueryRewindState extends Component {
	componentDidMount() {
		this.request();
	}

	componentDidUpdate( prevProps ) {
		if ( prevProps.siteId !== this.props.siteId ) {
			this.request();
		}
	}

	request() {
		const { requestState, siteId } = this.props;

		if ( ! siteId ) {
			return;
		}

		requestState( siteId );
	}

	render() {
		return null;
	}
}

const mapDispatchToProps = {
	requestState: requestRewindState,
};

export default connect( null, mapDispatchToProps )( QueryRewindState );
