import { Component, useEffect } from 'react';
import { connect, useDispatch } from 'react-redux';
import { requestRewindCapabilities } from 'calypso/state/rewind/capabilities/actions';

export const useQueryRewindCapabilities = ( siteId ) => {
	const dispatch = useDispatch();

	useEffect( () => {
		if ( ! siteId ) {
			return;
		}

		dispatch( requestRewindCapabilities( siteId ) );
	}, [ siteId, dispatch ] );
};

export class QueryRewindCapabilities extends Component {
	componentDidMount() {
		this.request();
	}

	componentDidUpdate( prevProps ) {
		if ( prevProps.siteId !== this.props.siteId ) {
			this.request();
		}
	}

	request() {
		const { requestCapabilities, siteId } = this.props;

		if ( ! siteId ) {
			return;
		}

		requestCapabilities( siteId );
	}

	render() {
		return null;
	}
}

const mapDispatchToProps = {
	requestCapabilities: requestRewindCapabilities,
};

export default connect( null, mapDispatchToProps )( QueryRewindCapabilities );
