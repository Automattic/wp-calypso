import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import { requestThemeFilters } from 'calypso/state/themes/actions';

export class QueryThemeFilters extends Component {
	static propTypes = {
		requestThemeFilters: PropTypes.func.isRequired,
		locale: PropTypes.func.isRequired,
	};

	componentDidMount() {
		this.props.requestThemeFilters( this.props.locale );
	}

	componentDidUpdate( prevProps ) {
		if ( prevProps.locale !== this.props.locale ) {
			this.props.requestThemeFilters( this.props.locale );
		}
	}

	render() {
		return null;
	}
}

export default connect( null, { requestThemeFilters } )( QueryThemeFilters );
